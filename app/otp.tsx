import { UserData } from '@/components/Interfaces';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width, height } = Dimensions.get('window');

const credentialspath = FileSystem.documentDirectory + 'credentials.json';



export default function otp() {
  const [paramdata, setParamdata] = useState<any>(null);
    const router = useRouter();
    const { params } = useLocalSearchParams();
    const [password, setPassword] = useState('');
    const [userData, setUserData] = useState<UserData | null>(null);

    const handlePayment = async () => {
      // let obj = {
      //   ...userData,
      //   balance: parseFloat(userData?.balance || '0') - parseFloat(data?.finalAmount || '0'),
      // }
      // await AsyncStorage.setItem('userData', JSON.stringify(obj));
      // router.push(`/paymentsuccess?params=${JSON.stringify(data)}`);
      // this  will update the balance of the user
      try {
        const content = await FileSystem.readAsStringAsync(credentialspath);
        const data = JSON.parse(content);
        data.user.balance = parseFloat(data?.user?.balance || '0') - parseFloat(paramdata?.finalAmount);
        await FileSystem.writeAsStringAsync(credentialspath, JSON.stringify(data, null, 2));
        console.log(data,"data in otp");
        setUserData(data?.user); 
      } catch (error) {
        console.error('Failed to update balance:', error);
      }
    }


  if(password.length === 4){
    try {
      if(userData?.pin === password){
        handlePayment();
        router.replace(`/paymentsuccess?params=${JSON.stringify(paramdata)}`);
        setPassword('');
      }else{
        Alert.alert('Nieprawidłowe hasło');
        setPassword('');
      }
    } catch (error) {
      console.error('Error in password validation:', error);
      Alert.alert('Error', 'Wystąpił błąd podczas weryfikacji hasła');
      setPassword('');
    }
  }
  
    const handleKeyPress = (num: string) => {
      try {
        if (password.length < 4) setPassword(password + num);
      } catch (error) {
        console.error('Error in handleKeyPress:', error);
      }
    };
    const handleBackspace = () => {
      try {
        setPassword(password.slice(0, -1));
      } catch (error) {
        console.error('Error in handleBackspace:', error);
      }
    };

    useEffect(() => {
      if(params){
          try {
              const obj = JSON.parse(params as string);
              console.log(obj, 'data in otp');
              setParamdata(obj);
          } catch (error) {
              console.error('Error parsing params:', error);
          }
      }
    }, [params]);
    
  //   useEffect(() => {
  //     const getUserData = async () => {
  //         const user = await AsyncStorage.getItem('userData');
  //         if (user) {
  //             setUserData(JSON.parse(user));
  //         }
  //     }
  //     getUserData();
  // }, []);
// console.log(userData,"userData in otp");
// console.log(password,"password in otp");

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
    <View style={{ backgroundColor: '#fff', flex: 1, width: width, height: "100%", paddingTop: 30 }}>


    <View style={styles.header} >
      <TouchableOpacity onPress={() => router.back()} >
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={{ color: 'black', fontSize: 18 }}>Operacja do zatwierdzenia</Text>
      <Text></Text>
    </View>
    <View style={[styles.box, { borderBottomWidth: 1, borderBottomColor: "black" }]} >
      <Text style={{ color: 'black', fontSize: 24, fontWeight: 'semibold' }}>Wykonaj przelew</Text>
      
    </View>
    

    <ScrollView style={{ paddingHorizontal: 10 }} >
    {/* Content */}
    <View style={styles.content}>
      {/* <Text style={styles.operationText}>Wykonaj operację</Text> */}
      <Text style={styles.instruction}>Podaj hasło mobilne aby zatwierdzić</Text>
      {/* <Text style={styles.instruction}>{password}</Text> */}

      {/* Password Dots */}
      <View style={styles.dotsRow}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.dot, password.length > i && styles.dotFilled]} />
        ))}
      </View>
      <View style={[styles.underline,]} >
        <View style={{ width: password.length * 60, height: 4, backgroundColor: '#6c63ff', borderRadius: 5 }} />
      </View>
      {/* Forgot password */}
      <TouchableOpacity>
        <Text style={styles.forgotText}>Nie pamiętam hasła mobilnego</Text>
      </TouchableOpacity>
      
    </View>
    {/* Keypad */}
    <View style={styles.keypad}>
      <View style={styles.keypadRow}>
        {[1, 2, 3].map(n => (
          <TouchableOpacity key={n} style={styles.key} onPress={() => handleKeyPress(n.toString())}>
            <Text style={styles.keyText}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.keypadRow}>
        {[4, 5, 6].map(n => (
          <TouchableOpacity key={n} style={styles.key} onPress={() => handleKeyPress(n.toString())}>
            <Text style={styles.keyText}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.keypadRow}>
        {[7, 8, 9].map(n => (
          <TouchableOpacity key={n} style={styles.key} onPress={() => handleKeyPress(n.toString())}>
            <Text style={styles.keyText}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.keypadRow}>
        <View style={styles.key} />
        <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('0')}>
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={handleBackspace}>
          <Ionicons name="backspace-outline" size={28} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
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
    headerTitle: {
      fontSize: 18,
      color: '#222',
      fontWeight: '500',
    },
    content: {
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 20,
    },
    operationText: {
      fontSize: 18,
      color: '#222',
      fontWeight: '400',
      marginBottom: 10,
    },
    instruction: {
      fontSize: 15,
      color: '#666',
      marginBottom: 30,
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
    },
    dot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: '#a7a7d9',
      marginHorizontal: 8,
      backgroundColor: '#fff',
    },
    dotFilled: {
      backgroundColor: '#6c63ff',
      borderColor: '#6c63ff',
    },
    underline: {
      width: 240,
      height: 4,
      backgroundColor: '#a7a7d9',
      borderRadius: 2,
      marginBottom: 18,
      marginTop: 12,
    },
    forgotText: {
      color: '#6c63ff',
      fontSize: 15,
      marginTop: 10,
      // textDecorationLine: 'underline',
    },
    keypad: {
      flex: 1,
      justifyContent: 'flex-end',
      marginBottom: 30,
    },
    keypadRow: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginBottom: 18,
    },
    key: {
      width: 70,
      height: 70,
      borderRadius: 35,
      // backgroundColor: '#f5f5fa',
      alignItems: 'center',
      justifyContent: 'center',
    },
    keyText: {
      fontSize: 28,
      color: '#222',
      fontWeight: '500',
    },
  });