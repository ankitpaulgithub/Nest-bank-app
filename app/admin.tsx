import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';
import credentials from '../constants/ceredentials.json';
const { width, height } = Dimensions.get('window');

const path = FileSystem.documentDirectory + 'credentials.json';
const path2 = FileSystem.documentDirectory + 'transaction.json';

// if you wnat to delete all the data from the file use this code
const resetCredentials = async (newData: any) => {
    try {
      // Overwrite the file with new data
      await FileSystem.writeAsStringAsync(path2, JSON.stringify(newData, null, 2));
      console.log('Credentials reset successfully');
    } catch (error) {
      console.error('Error resetting credentials:', error);
    }
  };
// resetCredentials({});


  
// Validation Schema
const AdminSchema = Yup.object().shape({
    companyName: Yup.string()
        .min(3, 'Nazwa firmy musi mieć minimum 3 znaki')
        .required('Nazwa firmy jest wymagana'),
    accountNumber: Yup.string()
        .required('Numer konta jest wymagany')
        .matches(/^[0-9\s]+$/, 'Numer konta może zawierać tylko cyfry')
        .test('length', 'Niepoprawna ilość znaków', (value) => {
            if (!value) return false;
            // Remove spaces before checking length
            const numbersOnly = value.replace(/\s/g, '');
            return numbersOnly.length === 26;
        }),
    balance: Yup.string()
        .required('Stan konta jest wymagany')
        .matches(/^\d+([,.]\d{1,2})?$/, 'Nieprawidłowy format kwoty')
        .test('balance', 'Stan konta musi być liczbą dodatnią', (value) => {
            if (!value) return false;
            const numValue = parseFloat(value.replace(',', '.'));
            return numValue >= 0;
        }),
});

interface FormValues {
    companyName: string;
    accountNumber: string;
    balance: string;
}

const saveToWritableLocation = async () => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(path);
        if (!fileInfo.exists) {
            await FileSystem.writeAsStringAsync(path, JSON.stringify(credentials, null, 2));
            console.log('File created at:', path);
        } 
    } catch (error) {
        console.error('Error saving credentials file:', error);
    }
  };


  const initTransactionFile = async () => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(path2);
        if (!fileInfo.exists) {
          const initialData = { transactions: [] };
          await FileSystem.writeAsStringAsync(path2, JSON.stringify(initialData, null, 2));
          console.log('Transaction file created at:', path2);
        }
    } catch (error) {
        console.error('Error initializing transaction file:', error);
    }
  };

export default function admin() {
    const router = useRouter();
    const [userData, setUserData] = useState<FormValues | null>(null);
    const [credential, setCredential] = useState<any>(null);
    const formatAccountNumber = (value: string) => {
        // Remove all spaces first
        const numbers = value.replace(/\s/g, '');
        // Format the number with spaces
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 6) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
        if (numbers.length <= 10) return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6)}`;
        if (numbers.length <= 14) return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)} ${numbers.slice(10)}`;
        if (numbers.length <= 18) return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)} ${numbers.slice(10, 14)} ${numbers.slice(14)}`;
        if (numbers.length <= 22) return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)} ${numbers.slice(10, 14)} ${numbers.slice(14, 18)} ${numbers.slice(18)}`;
        return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)} ${numbers.slice(10, 14)} ${numbers.slice(14, 18)} ${numbers.slice(18, 22)} ${numbers.slice(22, 26)}`;
    };

    const initialValues: FormValues = {
        companyName: '',
        accountNumber: '',
        balance: '',
    };

   

    const handleSubmit = async (values: FormValues) => {
        try {
            // Remove spaces from account number before submission
            const formattedValues = {
                ...values,
                accountNumber: values.accountNumber.replace(/\s/g, '')
            };

            // this  will update the balance of the user
            try {
                const content = await FileSystem.readAsStringAsync(path);
                const data = JSON.parse(content);
                data.user.accountNumber = formattedValues.accountNumber;
                data.user.name = formattedValues.companyName;
                data.user.balance = parseFloat(data?.user?.balance || '0') + parseFloat(formattedValues.balance);
                await FileSystem.writeAsStringAsync(path, JSON.stringify(data, null, 2));
                setCredential(data); 
              } catch (error) {
                console.error('Failed to update balance:', error);
              }
            // await AsyncStorage.setItem('userData', JSON.stringify(newObj));
            // Alert.alert('Sukces', 'Dane zostały zapisane pomyślnie');
            

            // this will update the transaction data
            try {
                      const content = await FileSystem.readAsStringAsync(path2);
                      let transactionData = JSON.parse(content);
                    //   console.log('Existing transaction data:', transactionData);
                
            
                        let newtransaction = { 
                          "credited": true,
                          "date": new Date(),
                          "deliveryType": "",
                          "finalAmount": formattedValues.balance,
                          "saveRecipient": false,
                          "title": formattedValues.companyName || "",
                          "values": {
                            "accountNumber": formattedValues.accountNumber || "",
                            "address": "",
                            "amount": formattedValues.balance || "",
                            "recipientName": "",
                            "transferTitle": ""
                          }
                        }
                
                        // Initialize transactions array if it doesn't exist
                        if (!transactionData || !transactionData.transactions) {
                          transactionData = { transactions: [] };
                        }
                
                        // Add new transaction
                        transactionData.transactions.push(newtransaction);
                        
                        // Save updated data
                        await FileSystem.writeAsStringAsync(path2, JSON.stringify(transactionData, null, 2));
                        // console.log('Transaction saved successfully:', newtransaction);
                      
                    } catch (error) {
                      console.error('Error updating transaction:', error);
                    }
                    Alert.alert('Sukces', 'płatność pomyślna.');
            router.replace('/');
        } catch (error) {
            Alert.alert('Błąd', 'Wystąpił błąd podczas zapisywania danych.');
        }
    };

    
    useEffect(() => {
        try {
            // resetCredentials(null);
            saveToWritableLocation();
            initTransactionFile();
        } catch (error) {
            console.error('Error in admin useEffect:', error);
        }
    }, []);

    return (
        <SafeAreaView style={{ backgroundColor: '#5e5498', width: width, height: "100%" }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={30}
            >
                <Formik
                    initialValues={initialValues}
                    validationSchema={AdminSchema}
                    onSubmit={handleSubmit}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <View style={[styles.box]}>
                                    <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>Admin Panel </Text>
                                </View>

                                <View style={[styles.box, { alignItems: "flex-start", width: "80%", paddingBottom: 0 }]}>
                                    <Text style={{ color: 'black', fontSize: 22, fontWeight: 'semibold' }}>Dane firmy: </Text>
                                </View>

                                <View style={[styles.box]}>
                                    <TextInput
                                        style={[
                                            styles.inputField,
                                            touched.companyName && errors.companyName && styles.inputError
                                        ]}
                                        placeholder='Nazwa i adres firmy'
                                        placeholderTextColor={'black'}
                                        onChangeText={handleChange('companyName')}
                                        onBlur={handleBlur('companyName')}
                                        value={values.companyName}
                                    />
                                    {touched.companyName && errors.companyName && (
                                        <Text style={styles.errorText}>{errors.companyName}</Text>
                                    )}
                                </View>

                                <View style={[styles.box]}>
                                    <TextInput
                                        style={[
                                            styles.inputField,
                                            touched.accountNumber && errors.accountNumber && styles.inputError
                                        ]}
                                        placeholder='Numer rachunku bankowego'
                                        placeholderTextColor={'black'}
                                        onChangeText={(text) => {
                                            // Remove all non-numeric characters
                                            const numbers = text.replace(/[^0-9]/g, '');
                                            // Format the number
                                            const formatted = formatAccountNumber(numbers);
                                            // Update the field value
                                            handleChange('accountNumber')(formatted);
                                        }}
                                        onBlur={handleBlur('accountNumber')}
                                        value={values.accountNumber}
                                        keyboardType="numeric"
                                        maxLength={32} // Increased to accommodate spaces
                                    />
                                    {touched.accountNumber && errors.accountNumber && (
                                        <Text style={styles.errorText}>{errors.accountNumber}</Text>
                                    )}
                                </View>

                                <View style={[styles.box]}>
                                    <TextInput
                                        style={[
                                            styles.inputField,
                                            touched.balance && errors.balance && styles.inputError
                                        ]}
                                        placeholder='Stan konta'
                                        placeholderTextColor={'black'}
                                        onChangeText={handleChange('balance')}
                                        onBlur={handleBlur('balance')}
                                        value={values.balance}
                                        keyboardType="numeric"
                                    />
                                    {touched.balance && errors.balance && (
                                        <Text style={styles.errorText}>{errors.balance}</Text>
                                    )}
                                </View>

                                <TouchableOpacity 
                                    style={styles.button} 
                                    onPress={() => handleSubmit()}
                                >
                                    <Text style={styles.buttonText}>Zapisz</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}
                </Formik>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    box: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: "center",
        padding: 10,
    },
    inputField: {
        width: '80%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        padding: 10,
        borderWidth: 2,
        borderColor: 'black',
        borderRadius: 30,
        paddingHorizontal: 20,
        color:"black"
    },
    inputError: {
        borderColor: '#ff3b30',
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 12,
        marginTop: 5,
        marginBottom: 5,
        width: '80%',
        textAlign: 'left',
        marginLeft: 10,
    },
    button: {
        width: '60%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        padding: 10,
        backgroundColor: 'black',
        borderRadius: 30,
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
        marginHorizontal: "auto",
        marginBottom: 50
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    logo: {
        width: 250,
        height: 250,
        resizeMode: 'contain',
        marginHorizontal: "auto"
    }
});