import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width, height } = Dimensions.get('window');





export default function screen4() {
    const [data, setData] = useState<any>(null);
    const router = useRouter();
    const { params } = useLocalSearchParams();


    useEffect(() => {
        if(params){
            const obj = JSON.parse(params as string);
            setData(obj)
        }
    }, [params]);
    const sum = data?.deliveryType === 'natychmiastowy' ? parseFloat(data?.values?.amount)+9.90 : parseFloat(data?.values?.amount) || 0;
    
    const formatAccountNumber = (value: string) => {
        if (!value) return '';
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


    const handlePayment = async () => {
        let newdata = {
            ...data,
            finalAmount: sum,
        }
        router.push(`/otp?params=${JSON.stringify(newdata)}`)
    }
    // console.log(userData);
    console.log(data,"obj in screen 4");




    
    return (
        <View style={{ backgroundColor: 'white', flex: 1, paddingTop: 30 }}>

            <View style={styles.header} >
                <TouchableOpacity onPress={() => router.back()} >
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={{ color: 'black', fontSize: 18 }}>Operacja do zatwierdzenia</Text>
                <Text></Text>
            </View>
                <View style={[styles.box,{borderBottomWidth:1, borderBottomColor:"black"}]} >
                    <Text style={{ color: 'black', fontSize: 24, fontWeight: 'semibold' }}>Wykonaj przelew</Text>
                </View>

            <ScrollView style={{ paddingHorizontal: 10,marginTop:10 }} >



                <View style={{ marginBottom: 10 }} >
                    <Text style={styles.titletext}>Dane odbiorcy</Text>
                    <Text style={styles.descriptiontext}>{formatAccountNumber(data?.values?.accountNumber) || '00'}</Text>
                </View>

                <View style={{ marginBottom: 10 }}>
                    <Text style={styles.sectionLabel}>{data?.values?.recipientName || ''}</Text>
                    <View style={styles.sectionDivider} />
                </View>

                <View style={{ marginBottom: 20 }} >
                    <Text style={styles.titletext}>Kwota</Text>
                    {/* <Text style={styles.descriptiontext}>{parseFloat(data?.values?.amount || '0.0').toFixed(2) || '0.0'} PLN</Text> */}
                    <Text style={styles.descriptiontext}>{sum.toFixed(2) || '0.0'} PLN</Text>
                </View>

                <View style={{ marginBottom: 20 }} >
                    <Text style={styles.titletext}>Tytuł</Text>
                    <Text style={styles.descriptiontext}>{data?.values?.transferTitle || ''}</Text>
                </View>

                <View style={{ marginBottom: 20 }} >
                    <Text style={styles.titletext}>Data realizacji</Text>
                    <Text style={styles.descriptiontext}>Następny dzień roboczy</Text>
                </View>

                <View style={{ marginBottom: 20 }} >
                    <Text style={styles.titletext}>Opłata za przelew:</Text>
                    <Text style={styles.descriptiontext}>0.00 PLN</Text>
                </View>

                <View style={styles.warningBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <Ionicons name="information-circle" size={22} color="#b85c00" style={{ marginRight: 8, marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.warningTitle}>Uważaj na oszustów!</Text>
                            <Text style={styles.warningText}>
                                Pamiętaj, pracownik banku nigdy nie poprosi Cię o podanie kodu PIN lub wykonanie przelewu.
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={handlePayment} >
                    <Text style={styles.buttonText}>Wyślij przelew</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button2} onPress={() => router.push('/screen3')} >
                    <Text style={[styles.buttonText, { color: 'black', fontWeight: 'semibold' }]}>Anuluj</Text>
                </TouchableOpacity>

            </ScrollView>

        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal:10,
        // borderBottomWidth: 0.5,
        // borderBottomColor: '#f2f2f2',
    },
    box: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    titletext: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'semibold',
    },
    descriptiontext: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'normal',
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
        fontWeight: 'semibold',
        textAlign: 'center',
        marginVertical: 10,
        marginHorizontal: "auto",
    },
    button2: {
        width: '60%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        padding: 10,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 30,
        color: 'black',
        fontSize: 20,
        fontWeight: 'semibold',
        textAlign: 'center',
        marginVertical: 10,
        marginHorizontal: "auto",
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',

    },
    warningBox: {
        backgroundColor: '#ffe0cc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        marginTop: 50
    },
    warningTitle: {
        color: '#b85c00',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 2,
    },
    warningText: {
        color: '#333',
        fontSize: 14,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: 'black',
        letterSpacing: 1,
        marginBottom: 4,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        width: '100%',
    },
});