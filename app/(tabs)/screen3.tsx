import { UserData } from '@/components/Interfaces';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Octicons from '@expo/vector-icons/Octicons';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { Formik, FormikHelpers } from 'formik';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';

const credentialspath = FileSystem.documentDirectory + 'credentials.json';

const { width, height } = Dimensions.get('window');

interface FormValues {
    recipientName: string;
    accountNumber: string;
    address: string;
    transferTitle: string;
    amount: string;
}

export default function screen3() {
    const router = useRouter();
    const [showAddress, setShowAddress] = useState(false);
    const [deliveryType, setDeliveryType] = useState('zwykly');
    const [saveRecipient, setSaveRecipient] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const currentAmount = parseFloat(userData?.balance || '0');

    // Validation Schema
    const TransferSchema = Yup.object().shape({
        recipientName: Yup.string()
            .min(2, 'Nazwa odbiorcy musi mieć minimum 2 znaki')
            .required('Nazwa odbiorcy jest wymagana'),
        accountNumber: Yup.string()
            .required('Numer konta jest wymagany')
            .matches(/^[0-9\s]+$/, 'Numer konta może zawierać tylko cyfry')
            .test('length', 'Niepoprawna ilość znaków', (value) => {
                if (!value) return false;
                // Remove spaces before checking length
                const numbersOnly = value.replace(/\s/g, '');
                return numbersOnly.length === 26;
            }),
        address: Yup.string()
            .when('showAddress', {
                is: true,
                then: (schema) => schema.required('Adres jest wymagany'),
                otherwise: (schema) => schema.notRequired(),
            }),
        transferTitle: Yup.string()
            .min(3, 'Tytuł przelewu musi mieć minimum 3 znaki')
            .required('Tytuł przelewu jest wymagany'),
        amount: Yup.string()
            .required('Kwota jest wymagana')
            .matches(/^[\d\s]+([,]\d{1,2})?$/, 'Nieprawidłowy format kwoty')
            .test('amount', 'Kwota musi być większa niż 0', (value) => {
                if (!value) return false;
                const numValue = parseFloat(value.replace(/\s/g, '').replace(',', '.'));
                return numValue > 0;
            })
            .test('maxAmount', 'Kwota nie może przekraczać dostępnych środków', (value) => {
                if (!value) return false;
                const numValue = parseFloat(value.replace(/\s/g, '').replace(',', '.'));
                return numValue <= currentAmount;
            }),
    });

    
    const deliveryOptions = [
        {
            key: 'zwykly',
            title: 'Przelew\nzwykły',
            desc: 'Po godzinie 15:00',
            fee: '0,00 PLN',
            cennik: true,
        },
        {
            key: 'natychmiastowy',
            title: 'Przelew\nnatychmiastowy',
            desc: 'W kilka sekund',
            fee: '9,90 PLN',
            cennik: false,
        },
    ];

    const initialValues: FormValues = {
        recipientName: '',
        accountNumber: '',
        address: '',
        transferTitle: '',
        amount: '',
    };

    const handleSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        try {
            // Remove spaces from account number before submission
            const formattedValues = {
                ...values,
                accountNumber: values.accountNumber.replace(/\s/g, ''),
                amount: values.amount.replace(/\s/g, '').replace(',', '.')
            };
            console.log('Form submitted:', formattedValues);
            if(deliveryType === 'natychmiastowy'){
                if(parseFloat(values?.amount) >= 1000){
                    Alert.alert("",'Przelew przekracza maksymalną kwotę przelewu ekspresowego');
                    return;
                }else{
                    Alert.alert('','Przelewy ekspresowe chwilowo niedostępne');
                    return;
                }
            }
            console.log('Delivery type:', deliveryType);
            console.log('Save recipient:', saveRecipient);
            const obj ={
                deliveryType: deliveryType,
                saveRecipient: saveRecipient,
                values: formattedValues,
            }
            console.log(obj,"obj");
            const params = JSON.stringify(obj);
            router.push(`/screen4?params=${params}`);
            
            // Navigate to OTP screen
            // router.push('/otp');
        } catch (error) {
            Alert.alert('Błąd', 'Wystąpił błąd podczas przetwarzania przelewu');
        } finally {
            setSubmitting(false);
        }
    };

    // Add this function before the return statement
    const formatAccountNumber = (value: string) => {
        try {
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
        } catch (error) {
            console.error('Error formatting account number:', error);
            return value; // Return original value if formatting fails
        }
    };


    useEffect(() => {
        const readCredentialFile = async () => {
            try {
              const content = await FileSystem.readAsStringAsync(credentialspath);
              const data = JSON.parse(content);
              // console.log(data,"data");
              setUserData(data?.user);
            } catch (error) {
              console.error("Error reading credential file:", error);
              // Set default user data to prevent crashes
              setUserData({
                balance: '0',
                name: 'User',
                accountNumber: '12345678901234567890123456',
                login: 'user',
                password: 'password',
                pin: '1234'
              });
            }
          };
          readCredentialFile();
    }, []);

    return (
        <View style={{ backgroundColor: '#e1e2e3', flex: 1, height: height, paddingTop: 30 }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'android' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={{ color: 'black', fontSize: 18 }}>Przelew krajowy</Text>
                    <Text></Text>
                </View>

                <Formik
                    initialValues={initialValues}
                    validationSchema={TransferSchema}
                    onSubmit={handleSubmit}
                    validateOnChange={true}
                    validateOnBlur={true}
                >
                    {({ 
                        handleChange, 
                        handleBlur, 
                        handleSubmit, 
                        values, 
                        errors, 
                        touched, 
                        isSubmitting,
                        setFieldValue 
                    }) => (
                        <ScrollView
                            style={{ paddingHorizontal: 5 }}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.topCard}>
                                <MaterialCommunityIcons
                                    name="shield-check"
                                    size={28}
                                    color="#5e5498"
                                    style={{ marginRight: 10 }}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.topCardTitle}>Przelew krajowy</Text>
                                </View>
                                <View style={styles.topCardCircle}>
                                    <Ionicons name="chevron-down" size={20} color="#5e5498" />
                                </View>
                            </View>

                            <View style={{ padding: 10, backgroundColor: '#fff', marginHorizontal: 10, borderRadius: 10 }}>
                                <Text style={styles.sectionTitle}>Przelew z</Text>
                                <View style={styles.sectionBox}>
                                    <View style={styles.accountRow}>
                                        <View style={styles.accountInfo}>
                                            <Text style={styles.accountAmount}>{parseFloat(currentAmount?.toString() || '0').toLocaleString('pl-PL', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })} PLN</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#bbb" />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Nazwa odbiorcy</Text>
                                    <View style={[
                                        styles.inputRow,
                                        touched.recipientName && errors.recipientName && styles.inputRowError
                                    ]}>
                                        <TextInput
                                            style={styles.input2}
                                            placeholder="Wpisz nazwę odbiorcy"
                                            placeholderTextColor="#bbb"
                                            onChangeText={handleChange('recipientName')}
                                            onBlur={handleBlur('recipientName')}
                                            value={values.recipientName}
                                        />
                                        <Octicons name="person" size={20} color="#5e5498" style={{ marginHorizontal: 10, borderColor: "#eee", borderLeftWidth: 1, paddingLeft: 10 }} />
                                    </View>
                                    {touched.recipientName && errors.recipientName && (
                                        <Text style={styles.errorText}>{errors.recipientName}</Text>
                                    )}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Numer konta</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            touched.accountNumber && errors.accountNumber && styles.inputError
                                        ]}
                                        placeholder="Wpisz numer konta"
                                        placeholderTextColor="#bbb"
                                        keyboardType="numeric"
                                        onChangeText={(text) => {
                                            // Remove all non-numeric characters
                                            const numbers = text.replace(/[^0-9]/g, '');
                                            // Format the number
                                            const formatted = formatAccountNumber(numbers);
                                            // Update the field value
                                            setFieldValue('accountNumber', formatted);
                                        }}
                                        onBlur={handleBlur('accountNumber')}
                                        value={values.accountNumber}
                                        maxLength={32} // Increased to accommodate spaces
                                    />
                                    {touched.accountNumber && errors.accountNumber && (
                                        <Text style={styles.errorText}>{errors.accountNumber}</Text>
                                    )}
                                </View>

                                <View style={styles.optionalHeader}>
                                    <Switch
                                        value={showAddress}
                                        onValueChange={(value) => {
                                            setShowAddress(value);
                                            if (!value) {
                                                setFieldValue('address', '');
                                            }
                                        }}
                                        trackColor={{ false: '#ccc', true: '#5e5498' }}
                                        thumbColor={showAddress ? '#fff' : '#fff'}
                                    />
                                    <Text style={styles.optionalLabel}>Adres odbiorcy (opcjonalnie)</Text>
                                </View>
                                {showAddress && (
                                    <View style={styles.optionalBox}>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>Adres</Text>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    touched.address && errors.address && styles.inputError
                                                ]}
                                                placeholder="Wpisz adres"
                                                placeholderTextColor="#bbb"
                                                onChangeText={handleChange('address')}
                                                onBlur={handleBlur('address')}
                                                value={values.address}
                                            />
                                            {touched.address && errors.address && (
                                                <Text style={styles.errorText}>{errors.address}</Text>
                                            )}
                                        </View>
                                    </View>
                                )}

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Tytuł przelewu</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            touched.transferTitle && errors.transferTitle && styles.inputError
                                        ]}
                                        placeholder="Wpisz tytuł"
                                        placeholderTextColor="#bbb"
                                        onChangeText={handleChange('transferTitle')}
                                        onBlur={handleBlur('transferTitle')}
                                        value={values.transferTitle}
                                    />
                                    {touched.transferTitle && errors.transferTitle && (
                                        <Text style={styles.errorText}>{errors.transferTitle}</Text>
                                    )}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Kwota</Text>
                                    <View style={[
                                        styles.inputRow,
                                        touched.amount && errors.amount && styles.inputRowError
                                    ]}>
                                        <TextInput
                                            style={[styles.input2, { flex: 1 }]}
                                            placeholder="0,00"
                                            placeholderTextColor="#bbb"
                                            keyboardType="numeric"
                                            onChangeText={(text) => {
                                                // Remove all non-numeric characters except comma
                                                const cleanText = text.replace(/[^0-9,]/g, '');
                                                
                                                // Handle comma as decimal separator
                                                const parts = cleanText.split(',');
                                                if (parts.length > 2) return; // Only allow one comma
                                                
                                                let formattedText = '';
                                                if (parts.length === 1) {
                                                    // No decimal part
                                                    const wholePart = parts[0].replace(/\s/g, '');
                                                    if (wholePart.length > 0) {
                                                        // Add thousand separators
                                                        formattedText = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
                                                    }
                                                } else {
                                                    // Has decimal part
                                                    const wholePart = parts[0].replace(/\s/g, '');
                                                    const decimalPart = parts[1];
                                                    
                                                    if (wholePart.length > 0) {
                                                        // Add thousand separators to whole part
                                                        const formattedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
                                                        formattedText = `${formattedWhole},${decimalPart}`;
                                                    } else {
                                                        formattedText = `,${decimalPart}`;
                                                    }
                                                }
                                                
                                                setFieldValue('amount', formattedText);
                                            }}
                                            onBlur={handleBlur('amount')}
                                            value={values.amount}
                                        />
                                        <Text style={styles.currencyLabel}>PLN</Text>
                                    </View>
                                    {touched.amount && errors.amount && (
                                        <Text style={styles.errorText}>{errors.amount}</Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.deliverySection}>
                                <Text style={styles.deliveryTitle}>Czas dostarczenia przelewu</Text>
                                <View style={styles.deliveryOptionsRow}>
                                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                        {deliveryOptions.map(option => (
                                            <TouchableOpacity
                                                key={option.key}
                                                style={[
                                                    styles.deliveryOption,
                                                    deliveryType === option.key && styles.deliveryOptionActive,
                                                    { minWidth: 200, maxWidth: 220, marginRight: 16 },
                                                ]}
                                                onPress={() => setDeliveryType(option.key)}
                                                activeOpacity={0.8}
                                            >
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.deliveryOptionTitle}>{option.title}</Text>
                                                        <Text style={styles.deliveryOptionDesc}>{option.desc}</Text>
                                                        <Text style={styles.deliveryOptionFee}>Opłata: <Text style={{ fontWeight: 'bold' }}>{option.fee}</Text></Text>
                                                    </View>
                                                    {deliveryType === option.key && (
                                                        <View style={styles.deliveryCheckMark}>
                                                            <Ionicons name="checkmark" size={16} color="#5e5498" />
                                                        </View>
                                                    )}
                                                </View>
                                                {deliveryType === option.key && (
                                                    <TouchableOpacity>
                                                        <Text style={styles.deliveryCennik}>CENNIK</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                                {
                                    deliveryType === 'natychmiastowy' ?(
                                        <View style={{paddingHorizontal:10}}>
                                            <Text style={{color:"orange", fontSize:14}}>Przelew natychmiastowy dostępny jest do kwoty 1000 PLN</Text>
                                        </View>
                                    ):
                                    <View style={{paddingHorizontal:10}}>
                                            <Text style={{color:"orange", fontSize:14}}>Przelew w trybie zwykłym jest realizowany na następny dzień roboczy</Text>
                                        </View>
                                }

                                <View style={styles.saveRecipientRow}>
                                    <Switch
                                        value={saveRecipient}
                                        onValueChange={setSaveRecipient}
                                        trackColor={{ false: '#ccc', true: '#5e5498' }}
                                        thumbColor={saveRecipient ? '#fff' : '#fff'}
                                    />
                                    <Text style={styles.saveRecipientLabel}>Zapisz odbiorcę</Text>
                                </View>

                                <View style={styles.deliveryButtonsRow}>
                                    <TouchableOpacity 
                                        style={styles.deliveryCancelBtn}
                                        onPress={() => router.back()}
                                    >
                                        <Text style={styles.deliveryCancelText}>ANULUJ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => handleSubmit()} 
                                        style={[
                                            styles.deliveryNextBtn,
                                            isSubmitting && styles.deliveryNextBtnDisabled
                                        ]}
                                        disabled={isSubmitting}
                                    >
                                        <Text style={styles.deliveryNextText}>
                                            {isSubmitting ? 'PRZETWARZANIE...' : 'DALEJ'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    )}
                </Formik>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f2f2f2',
        backgroundColor: 'white',
        paddingHorizontal: 10
    },
    sectionBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 4,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
    },
    accountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    accountInfo: {
        flexDirection: 'column',
        flex: 1,
    },
    accountNumberBox: {
        backgroundColor: '#000',
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginBottom: 6,
    },
    accountNumber: {
        color: '#fff',
        fontSize: 15,
        letterSpacing: 1,
    },
    accountAmount: {
        fontSize: 16,
        color: 'black',
        fontWeight: 'bold',
    },
    inputGroup: {
        marginBottom: 4,
    },
    inputLabel: {
        fontSize: 14,
        color: '#888',
        marginBottom: 6,
        fontWeight: '500',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
        overflow: "hidden",
    },
    input: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        flex: 1,
        width: "100%",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#eee",
        overflow: "hidden",
        color:"#5e5498",
        fontWeight:"semibold"
    },
    input2: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        flex: 1,
        width: "100%",
        borderRadius: 8,
        overflow: "hidden",
        color:"#5e5498",
        fontWeight:"semibold"
    },
    currencyLabel: {
        fontSize: 16,
        color: '#888',
        marginLeft: 8,
        fontWeight: '500',
        marginRight: 10,
    },
    optionalBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#eee',
    },
    optionalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionalLabel: {
        marginLeft: 8,
        fontSize: 15,
        color: '#222',
        fontWeight: '500',
    },
    topCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 18,
        marginHorizontal: 10,
        marginTop: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    topCardTitle: {
        color: '#5e5498',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 2,
    },
    topCardCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 4,
        borderColor: '#e6e6e6',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    deliverySection: {
        backgroundColor: '#fff',
        margin: -5,
        marginTop: 24,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
        paddingHorizontal: 10
    },
    deliveryTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222',
        marginVertical: 10,
    },
    deliveryOptionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    deliveryOption: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#eee',
        borderRadius: 10,
        padding: 14,
        backgroundColor: '#fafafa',
        minHeight: 110,
        justifyContent: 'space-between',
        marginBottom: 8,
        position: 'relative',
    },
    deliveryOptionActive: {
        borderColor: '#5e5498',
        backgroundColor: '#fff',
        shadowColor: '#5e5498',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    deliveryOptionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 2,
    },
    deliveryOptionDesc: {
        fontSize: 13,
        color: '#888',
        marginBottom: 6,
    },
    deliveryOptionFee: {
        fontSize: 13,
        color: '#222',
        marginBottom: 2,
    },
    deliveryCennik: {
        color: '#5e5498',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'right',
        marginTop: 4,
    },
    deliveryCheckMark: {
        position: 'absolute',
        top: 1,
        right: 1,
        backgroundColor: '#fff',
    },
    saveRecipientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        marginTop: 2,
    },
    saveRecipientLabel: {
        marginLeft: 8,
        fontSize: 15,
        color: '#222',
        fontWeight: '500',
    },
    deliveryButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 16,
    },
    deliveryCancelBtn: {
        flex: 1,
        backgroundColor: '#eee',
        borderRadius: 8,
        paddingVertical: 14,
        marginRight: 8,
        alignItems: 'center',
    },
    deliveryCancelText: {
        color: '#5e5498',
        fontWeight: 'bold',
        fontSize: 16,
    },
    deliveryNextBtn: {
        flex: 1,
        backgroundColor: '#5e5498',
        borderRadius: 8,
        paddingVertical: 14,
        marginLeft: 8,
        alignItems: 'center',
    },
    deliveryNextText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    inputError: {
        borderColor: '#ff3b30',
    },
    inputRowError: {
        borderColor: '#ff3b30',
    },
    deliveryNextBtnDisabled: {
        opacity: 0.7,
    },
});