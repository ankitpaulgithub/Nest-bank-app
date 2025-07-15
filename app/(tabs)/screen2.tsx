import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, Dimensions, Image, ScrollView } from 'react-native';

import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';


import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
const { width, height } = Dimensions.get('window');

export default function screen2() {
    const [tab, setTab] = useState('Nowe');
    const router = useRouter();
    const buttons = [
        {
            name: 'Nowe',
            
        },
        {
            name: 'Cykliczne',
        },
        {
            name: 'Oczekujące',
        },
        {
            name: 'Do zatwierdzenia',
        },
    ]
    const tabitems = [
        {
            name: 'Przelew zwykły i natychmiastowy',
            icon: <FontAwesome5 name="exchange-alt" size={20} color="black" />,
            url:'/screen3'       
        },
        {
            name: 'Przelew własny',
            icon: <Ionicons name="return-down-forward-outline" size={24} color="black" />,
            url:'/errorscreen'
        },
        {
            name: 'Przelew na telefon BLIK',
            icon: <MaterialCommunityIcons name="web" size={24} color="black" />,
            url:'/errorscreen'
        },
        {
            name: 'Przelew walutowy',
            icon: <MaterialCommunityIcons name="web" size={24} color="black" />,
            url:'/errorscreen'
        },
        {
            name: 'Przelew podatkowy',
            icon: <MaterialCommunityIcons name="bank-transfer" size={24} color="black" />,       
            url:'/errorscreen'
        },
        {
            name: 'Doładowanie telefonu',
            icon: <AntDesign name="mobile1" size={24} color="black" />,
            url:'/errorscreen'
        },
        {
            name: 'Przelew - kod QR',
            icon: <MaterialIcons name="qr-code-scanner" size={24} color="black" />,
            url:'/errorscreen'
        },
        {
            name: 'Przelew podzielony',
            icon: <MaterialIcons name="call-split" size={24} color="black" />,
            url:'/errorscreen'
        },
        {
            name: 'Zlecenie stałe',
            icon: <Ionicons name="sync" size={24} color="black" />,
            url:'/errorscreen'
        },
    ]

    return (
        <SafeAreaView style={{ backgroundColor: '#2b343b', flex: 1, paddingTop: 30 }}>
            <View style={styles.box} >
                <Text style={{ color: 'white', fontSize: 40, fontWeight: 'bold' }}>Płatności</Text>
            </View>

            <View style={styles.buttonContainer}>
                <ScrollView horizontal={true} contentContainerStyle={styles.buttonContainer}>
                    {buttons.map((button, index) => (
                        <TouchableOpacity onPress={() => setTab(button.name)} style={[styles.button, { borderColor: button.name === tab ? '#5e5498' : '#f2f2f2'}]} key={index}>
                            <Text style={styles.buttonText}>{button.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.scrollContainer}>
                <ScrollView showsVerticalScrollIndicator={true}>
                    {tabitems.map((button, index) => (
                        <TouchableOpacity style={styles.itemContainer} onPress={() => router.push(`${button?.url}` as any)} key={index}>
                            <View style={styles.itemContent}>
                                {button.icon}
                                <Text style={styles.buttonText2}>{button.name}</Text>
                            </View>
                            <Ionicons style={{margin:10}} name="chevron-forward" size={20} color="black" />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    box: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginVertical: 20
    },
    button: {
        padding: 10,
        backgroundColor: '#2b343b',
        borderBottomWidth: 4,
        borderColor: '#f2f2f2',
        paddingHorizontal: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'semibold',
        textAlign: 'center',
    },
    buttonText2: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'semibold',
        flex: 1,
        flexWrap: 'wrap',
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // height: 60,
    },
    itemContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 60,
        padding: 10,
        paddingHorizontal: 20,
    },
    itemContent: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        flex: 1,
        marginRight: 10,
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
});