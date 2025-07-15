import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,BackHandler } from 'react-native';
import * as Yup from 'yup';
import credentials from '../constants/ceredentials.json';
import transaction from '../constants/transaction.json';
const {width, height} = Dimensions.get('window');

const path = FileSystem.documentDirectory + 'credentials.json';
const path2 = FileSystem.documentDirectory + 'transaction.json';

// Validation Schema
const LoginSchema = Yup.object().shape({
    login: Yup.string()
        .min(3, 'Login musi mieć minimum 3 znaki')
        .required('Login jest wymagany'),
    password: Yup.string()
        .min(6, 'Hasło musi mieć minimum 6 znaków')
        .required('Hasło jest wymagane')
        .matches(
            /^[a-zA-Z0-9]+$/,
            'Hasło może zawierać tylko litery i cyfry'
        ),
});

const resetCredentials = async (newData: any) => {
    try {
      // Overwrite the file with new data
      await FileSystem.writeAsStringAsync(path2, JSON.stringify(newData, null, 2));
      console.log('Credentials reset successfully');
    } catch (error) {
      console.error('Error resetting credentials:', error);
    }
  };

interface FormValues {
    login: string;
    password: string;
}

const setDynamicTransactionDates = (transactions: any[]) => {
    const now = new Date();
    const usedOffsets = new Set<number>();
  
    const getRandomOffset = () => {
      let offset;
      do {
        offset = Math.floor(Math.random() * 30) + 1; // 1 to 30 (avoid today)
      } while (usedOffsets.has(offset));
      usedOffsets.add(offset);
      return offset;
    };
  
    return transactions.map(transaction => {
      const offset = getRandomOffset(); // e.g., 1 = yesterday, 5 = 5 days ago
      const date = new Date(now);
      date.setDate(now.getDate() - offset);
      date.setHours(12, 12, 30, 231); // fixed time
  
      return {
        ...transaction,
        date: date.toISOString()
      };
    });
  };
  
const saveToWritableLocation = async () => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(path);
        if (!fileInfo.exists) {
          await FileSystem.writeAsStringAsync(path, JSON.stringify(credentials, null, 2));
          console.log('File saved for editing at:', path);
        }
    } catch (error) {
        console.error('Error saving credentials file:', error);
    }
  };

  const saveTransactionToWritableLocation = async () => {
    // try {
    //     const fileInfo = await FileSystem.getInfoAsync(path2);
    //     if (!fileInfo.exists) {
    //        await resetCredentials(transaction);
    //     //   const initialData = transaction;
    //     //   console.log(initialData,"initialData");
    //     //   await FileSystem.writeAsStringAsync(path2, JSON.stringify(initialData, null, 2));
    //     //   console.log('Transaction file created at:', path2);
    //     }
    //     else{
    //         console.log("file exists");
    //     }
    // } catch (error) {
    //     console.error('Error saving transaction file:', error);
    // }

    try {
        const fileInfo = await FileSystem.getInfoAsync(path2);
        if (!fileInfo.exists) {
          const dynamicTransactions = setDynamicTransactionDates(transaction.transactions);
          const newTransactionData = { transactions: dynamicTransactions };
    
          await resetCredentials(newTransactionData);
          console.log("Transaction file created with dynamic dates at:", path2);
        } else {
          console.log("Transaction file already exists.");
        }
      } catch (error) {
        console.error("Error saving transaction file:", error);
      }
  };

  

export default function HomeScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [credential, setCredential] = useState<any>(null);
    const [key, setKey] = useState(0);
    const initialValues: FormValues = {
        login: '',
        password: '',
    };
    const [currentIndexCheck, setCurrentIndexCheck] = useState<any>(null);
    const updatePasswordIndex = async () => {
        try {
          const currentIndex = await AsyncStorage.getItem('currentPasswordIndex');
          const currentValue = currentIndex ? parseInt(currentIndex) : 0;
          const newIndex = currentValue >= 99 ? 0 : currentValue + 1;
          await AsyncStorage.setItem('currentPasswordIndex', newIndex.toString());
          console.log(newIndex, "newIndex is set in async storage");
        } catch (error) {
          console.error('Error updating password index:', error);
        }
      }
    
    const handleSubmit = async (values: FormValues) => {

        try {
            // Here you would typically make an API call to authenticate

            console.log('Login attempt:', values);

                if (values.login === credentials?.admin?.login && values.password === credentials?.admin?.password) {
                router.push('/admin');
            } else if(values.login === credentials?.user?.login && values.password === credentials?.user?.password[currentIndexCheck ? parseInt(currentIndexCheck) : 0]) {
                updatePasswordIndex();
                router.push('/(tabs)/screen1');
            } else {
                Alert.alert('Błąd', 'Nieprawidłowy login lub hasło');
            }
        } catch (error) {
            Alert.alert('Błąd', 'Wystąpił błąd podczas logowania');
        }
    };

    const readCredentialFile = async () => {
        try {
            
            const content = await FileSystem.readAsStringAsync(path);
            const data = JSON.parse(content);
            // console.log(data,"data");
            setCredential(data);
        } catch (error) {
            console.log(error,"error in reading credential file");
        }
      };

    const getCurrentIndex = async () => {
        try {
            const currentIndex = await AsyncStorage.getItem('currentPasswordIndex');
            // console.log(currentIndex,"currentIndex getting from async storage");
            setCurrentIndexCheck(currentIndex ? parseInt(currentIndex) : 0);
        } catch (error) {
            console.error('Error getting current index:', error);
            setCurrentIndexCheck(0);
        }
    }

    const initializePasswordUsage = async () => {
        try {
          const usageStr = await AsyncStorage.getItem('currentPasswordUsageCount');
          if (usageStr === null) {
            await AsyncStorage.setItem('currentPasswordUsageCount', '0');
            console.log('Initialized currentPasswordUsageCount to 0');
          }
        } catch (error) {
          console.error('Error initializing usage count:', error);
        }
      };

    // Force refresh on every mount and focus
    const refreshPage = useCallback(() => {
        try {
            console.log('Refreshing login page...');
            setKey(prev => prev + 1);
            getCurrentIndex();
        } catch (error) {
            console.error('Error refreshing page:', error);
        }
    }, []);

    // Refresh on mount and when refresh parameter changes
    useEffect(() => {
        const initializeLogin = async () => {
            try {
                // Clear any stored authentication state to ensure fresh start
                await AsyncStorage.removeItem('userAuthenticated');
                await AsyncStorage.removeItem('lastLoginTime');
                
                saveToWritableLocation();
                readCredentialFile();
                saveTransactionToWritableLocation();
                await initializePasswordUsage();
                refreshPage();
                console.log('Login page mounted/refreshed with params:', params);
            } catch (error) {
                console.error('Error in useEffect:', error);
            }
        };
        
        initializeLogin();
    }, [params.refresh]); // Re-run when refresh parameter changes

    // Refresh on focus
    // useFocusEffect(
    //     useCallback(() => {
    //         try {
    //             console.log('Login screen focused - refreshing...');
    //             refreshPage();
    //         } catch (error) {
    //             console.error('Error in useFocusEffect:', error);
    //         }
    //     }, [refreshPage])
    // );

    useFocusEffect(
        useCallback(() => {
          try {
            refreshPage();
            const onBackPress = () => {
              try {
                // Optional: show confirmation before exit
                Alert.alert('Exit App', 'Do you want to exit?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Exit', onPress: () => {
                    try {
                      // updatePasswordIndex();
                    //   router.replace('/errorscreen'); // Any temporary screen
                         
                      BackHandler.exitApp()
                    } catch (error) {
                      console.error('Error in exit app:', error);
                    }
                  } },
                ]);
                return true; // Prevent default back behavior
              } catch (error) {
                console.error('Error in onBackPress:', error);
                return true;
              }
            };
    
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    
            return () => subscription.remove();
          } catch (error) {
            console.error('Error in useFocusEffect:', error);
          }
        }, [])
      );

// console.log(credentials,"credential");
console.log(currentIndexCheck,"currentIndexCheck");
    return (
        <SafeAreaView key={key} style={{ backgroundColor: '#c7c5dc', width: width, height: "100%", paddingTop: 40 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={30}
            >
                <Formik
                    initialValues={initialValues}
                    validationSchema={LoginSchema}
                    onSubmit={handleSubmit}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                            <View style={styles.box}>
                                <Text style={{ color: 'black', fontSize: 40, fontWeight: 'bold' }}>Hello</Text>
                            </View>

                            <View style={[styles.box]}>
                                <Text style={{ color: 'black', fontSize: 20, fontWeight: 'bold' }}>NestBank Business</Text>
                            </View>

                            <View style={[styles.box]}>
                                <Image source={require('../assets/images/nestlogo.png')} style={styles.logo}/>
                            </View>

                            <View style={[styles.box, {marginTop: "auto",flexDirection:"column",alignItems:"center" }]}>
                                <TextInput
                                    style={[
                                        styles.inputField,
                                        touched.login && errors.login && styles.inputError
                                    ]}
                                    placeholder='Login'
                                    placeholderTextColor={'black'}
                                    onChangeText={handleChange('login')}
                                    onBlur={handleBlur('login')}
                                    value={values.login}
                                />
                                {touched.login && errors.login && (
                                    <Text style={styles.errorText}>{errors.login}</Text>
                                )}
                            </View>

                            <View style={[styles.box,{flexDirection:"column",alignItems:"center" }]}>
                                <TextInput
                                    style={[
                                        styles.inputField,
                                        touched.password && errors.password && styles.inputError
                                    ]}
                                    placeholder='Hasło'
                                    placeholderTextColor={'black'}
                                    onChangeText={handleChange('password')}
                                    onBlur={handleBlur('password')}
                                    value={values.password}
                                    secureTextEntry
                                />
                                {touched.password && errors.password && (
                                    <Text style={styles.errorText}>{errors.password}</Text>
                                )}
                            </View>

                            <TouchableOpacity 
                                style={styles.button} 
                                onPress={() => handleSubmit()}
                            >
                                <Text style={styles.buttonText}>Zaloguj</Text>
                            </TouchableOpacity>
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
        flexDirection: 'row',
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
