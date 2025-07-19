import Ionicons from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const path = FileSystem.documentDirectory + 'transaction.json';




export default function paymentsuccess() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();
  const { params } = useLocalSearchParams();

  const updateTransaction = async () => {
    try {
      const content = await FileSystem.readAsStringAsync(path);
      let transactionData = JSON.parse(content);
      console.log('Existing transaction data:', transactionData);

      if(data){
        let newtransaction = { 
          "credited": false,
          "date": new Date(),
          "deliveryType": data?.deliveryType,
          "finalAmount": data?.finalAmount,
          "saveRecipient": false,
          "title": data?.values?.transferTitle || "",
          "values": {
            "accountNumber": data?.values?.accountNumber || "",
            "address": data?.values?.address || "",
            "amount": data?.values?.amount || "",
            "recipientName": data?.values?.recipientName || "",
            "transferTitle": data?.values?.transferTitle || ""
          }
        }

        // Initialize transactions array if it doesn't exist
        if (!transactionData || !transactionData.transactions) {
          transactionData = { transactions: [] };
        }

        // Add new transaction
        transactionData.transactions.push(newtransaction);
        
        // Save updated data
        await FileSystem.writeAsStringAsync(path, JSON.stringify(transactionData, null, 2));
        console.log('Transaction saved successfully:', newtransaction);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
    
    setTimeout(() => {
      router.replace('/screen1')
      // router.push('/(tabs)');
    }, 3000);
  };



  useEffect(() => {
    if (params) {
      try {
        const obj = JSON.parse(params as string);
        console.log('Parsed params:', obj);
        setData(obj);
      } catch (error) {
        console.error('Error parsing params:', error);
      }
    }
  }, [params]);

  useEffect(() => {
    if(data){
      updateTransaction()
    }
  }, [data])

  console.log('Current data state:', data);
  console.log('Values from data:', data?.values);

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark" size={80} color="#2e9b4d" style={styles.checkIcon} />
      <Text style={styles.title}>Przelew zlecony</Text>
      <Text style={styles.amount}>{parseFloat(data?.finalAmount?.toString() || '0').toLocaleString('pl-PL', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) || '0'} PLN</Text>
      <Text style={styles.recipient}>{data?.companyName}</Text>
      <Text style={styles.subtitle}>{data?.title}</Text>
      <Text style={styles.date}>Data realizacji: {new Date().toLocaleDateString()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  checkIcon: {
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
  },
  recipient: {
    fontSize: 16,
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    color: '#222',
    marginTop: 6,
    textAlign: 'center',
  },
})