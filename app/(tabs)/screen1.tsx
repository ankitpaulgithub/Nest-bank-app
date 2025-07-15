import { UserData } from '@/components/Interfaces';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ViewToken } from 'react-native';
import { Alert, BackHandler, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Generatepdf from '../../components/Generatepdf';
const { width, height } = Dimensions.get('window');

const path = FileSystem.documentDirectory + 'transaction.json';
const credentialspath = FileSystem.documentDirectory + 'credentials.json';

// Function to format date as relative time
const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  // Normalize to midnight for accurate day comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = nowOnly.getTime() - dateOnly.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Dzisiaj';
  } else if (diffDays === 1) {
    return 'Wczoraj';
  } else {
    return `${diffDays} dni temu`;
  }
};

const quickActions = [
  { icon: 'add', label: 'Nowy skrót' },
  { icon: 'swap-horizontal', label: 'Przelew zwykły' },
  { icon: 'b', label: 'BLIK', isBlik: true },
  { icon: 'account-balance', label: 'Przelew podatkowy', isMaterial: true },
];


// const saveToWritableLocation = async () => {
//   const fileInfo = await FileSystem.getInfoAsync(path);
//   if (!fileInfo.exists) {
//     const initialData = {
//       transactions: []
//     };
//     await FileSystem.writeAsStringAsync(path, JSON.stringify(initialData, null, 2));
//     console.log('File created at:', path);
//   }
// };

export default function TabTwoScreen() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const flatListRef = useRef(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<any>([]);
  const [sortedTransactions, setSortedTransactions] = useState<any>([]);

  const onViewRef = useRef((info: { viewableItems: ViewToken[] }) => {
    if (info.viewableItems.length > 0 && typeof info.viewableItems[0].index === 'number') {
      setSelectedIndex(info.viewableItems[0].index);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const updatePasswordIndex = async () => {
    try {
      const indexStr = await AsyncStorage.getItem('currentPasswordIndex');
      const usageStr = await AsyncStorage.getItem('currentPasswordUsageCount');
  
      const currentIndex = indexStr ? parseInt(indexStr) : 0;
      const currentUsage = usageStr ? parseInt(usageStr) : 0;
  
      if (currentUsage < 1) {
        // Increase usage count (0 → 1)
        await AsyncStorage.setItem('currentPasswordUsageCount', (currentUsage + 1).toString());
        console.log(`Password at index ${currentIndex} used ${currentUsage + 1} time(s)`);
      } else {
        // Reset usage count and move to next password
        const newIndex = currentIndex >= 99 ? 0 : currentIndex + 1;
        await AsyncStorage.setItem('currentPasswordIndex', newIndex.toString());
        await AsyncStorage.setItem('currentPasswordUsageCount', '0');
        console.log(`Password index updated to ${newIndex}`);
      }
    } catch (error) {
      console.error('Error updating password index:', error);
    }
  };

  const readTransactionFile = async () => {
    try {
        const content = await FileSystem.readAsStringAsync(path);
        const data = JSON.parse(content);
        const transactionsData = data?.transactions || [];
        setTransactions(transactionsData);
        // Sort transactions when they are loaded
        const sorted = [...transactionsData].sort((a: any, b: any) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setSortedTransactions(sorted);
    } catch (error) {
        console.error('Error reading transaction file:', error);
        setTransactions([]);
        setSortedTransactions([]);
    }
  };
  const readCredentialFile = async () => {
    try {
      const content = await FileSystem.readAsStringAsync(credentialspath);
      const data = JSON.parse(content);
      // console.log(data,"data");
      setUserData(data?.user);
    } catch (error) {
      console.log(error, "error in reading credential file");
    }
  };
  useEffect(() => {
    try {
      // saveToWritableLocation();   // ✅ Only creates file if not exists
      readTransactionFile();
      readCredentialFile();
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, []);

  const accounts = [
    {
      id: '1',
      name: userData?.name,
      number: userData?.accountNumber,
      balance: userData?.balance,
    },
    {
      id: '2',
      name: userData?.name,
      number: userData?.accountNumber,
      balance: userData?.balance,
    },
  ];

  const handleHistory = () => {
    try {
      Alert.alert("Nie masz uprawnień",)
    } catch (error) {
      console.error('Error in handleHistory:', error);
    }
  }

  const iconsClick = () => {
    try {
      Alert.alert("Nie masz uprawnień dla tej funkcji",)
    } catch (error) {
      console.error('Error in iconsClick:', error);
    }
  }

  const PDFgenerate = async (item: any) => {
    try {
      // console.log(item,"item in generatePDF");
      await Generatepdf(userData, item);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  }


  // 10-minute password timeout
  useEffect(() => {
    try {
      const passwordTimeout = setTimeout(() => {
        try {
          updatePasswordIndex();
          console.log("Password index updated after 10 minutes");
          router.replace('/errorscreen'); // Any temporary screen
          setTimeout(() => {
            router.replace(`/?refresh=${Date.now()}`);
          }, 10);
        } catch (error) {
          console.error('Error in password timeout:', error);
        }
      }, 10 * 60 * 1000); // 10 minutes in milliseconds

      // Cleanup timeout on component unmount
      return () => clearTimeout(passwordTimeout);
    } catch (error) {
      console.error('Error setting up password timeout:', error);
    }
  }, []); // Run only once when component mounts

  useFocusEffect(
    useCallback(() => {
      try {
        const onBackPress = () => {
          try {
            // Optional: show confirmation before exit
            Alert.alert('Exit App', 'Do you want to exit?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Exit', onPress: () => {
                try {
                  updatePasswordIndex();
                  router.replace('/errorscreen'); // Any temporary screen
                  setTimeout(() => {
                    router.replace(`/?refresh=${Date.now()}`);
                  }, 10);
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

  // console.log(userData, "userData");
  return (
    <View style={{ flex: 1, backgroundColor: '#2b343b',paddingTop: 30 }}>

      {/* header */}
      <View style={styles.header}>
        <Text style={{ color: 'white', fontSize: 16, }}>{userData?.name}</Text>
        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "semibold" }}>{userData?.accountNumber}

          <Entypo name="chevron-small-down" size={18} color="#fff" />
        </Text>

        <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
          <TouchableOpacity style={styles.settingsIcon}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsIcon}>
            <Octicons name="mail" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>


      {/* Account Slider */}
      <FlatList
        ref={flatListRef}
        data={accounts}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 8, backgroundColor: '#2b343b', minHeight: 490, }}
        renderItem={({ item }) => (
          <View style={{ height: 390, borderBottomWidth: 1, borderBottomColor: "#222", shadowColor: "black", marginVertical: 10 }}>
            <View style={styles.headerCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={styles.accountName}>{item.name}</Text>
                  <Text style={styles.accountNumber}>{item.number?.slice(0, 4) + "••••••••••••••••••••"}
                    <Ionicons name="share-social-outline" size={18} color="#fff" />
                  </Text>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Text style={styles.accountDetails}>Szczegóły konta</Text>
                    <Ionicons name="chevron-forward" size={16} color="#fff" style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity>

                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 18, marginLeft: "auto", }}>
                <Text style={styles.balanceLabel}>Dostępne środki</Text>
                <Text style={styles.balanceValue}>{parseFloat(item.balance || '0').toFixed(2)} PLN</Text>
              </View>

            </View>
            {/* Slider Dots */}
            <View style={styles.sliderDotsRow}>
              {accounts.map((_, idx) => (
                <View key={idx} style={[styles.sliderDot, selectedIndex === idx && styles.sliderDotActive]} />
              ))}
            </View>
          </View>
        )}

        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
      />

      {/* Main Content ScrollView */}
      <ScrollView contentContainerStyle={{ paddingBottom: 30, borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: "#fff", minHeight: height }} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          {quickActions.map((action, idx) => (
            <TouchableOpacity onPress={iconsClick} key={idx} style={styles.quickActionBtn}>
              {action.isBlik ? (
                <View style={styles.quickActionBtnicons}>
                  {/* <FontAwesome5 name="b" size={28} color="#fff" style={{ fontWeight: 'bold' }} /> */}
                  <Image source={require('../../assets/images/blik.png')} style={{ width: 28, height: 28 }} />
                </View>
              ) : action.isMaterial ? (
                <View style={styles.quickActionBtnicons}>
                  <MaterialIcons name="account-balance" size={28} color="#fff" />
                </View>
              ) : (
                <View style={styles.quickActionBtnicons}>
                  <Ionicons name={action.icon as any} size={28} color="#fff" />
                </View>
              )}
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* History */}
        <View style={styles.historyHeaderRow}>
          <Text style={styles.historyHeader}>Historia - {accounts[selectedIndex].name}</Text>
          <Ionicons name="chevron-down" size={18} color="#222" style={{ marginLeft: 4 }} />


          <TouchableOpacity onPress={() => PDFgenerate(sortedTransactions?.[0])} style={{ backgroundColor: "#5e5498", padding: 10, borderRadius: 10, margin: 10, alignItems: "center", justifyContent: "center", width: "auto", alignSelf: "center", marginLeft: "auto" }}>
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "semibold" }}>Pobierz ostatnią transakcję</Text>
          </TouchableOpacity>
        </View>
        {/* Transaction List */}
        {sortedTransactions && sortedTransactions?.length > 0 && sortedTransactions?.slice(0,12)?.map((item: any, index: any) => {
          // console.log('Transaction item:', item);
          return (
            <View style={[styles.transactionItem, { backgroundColor: '#fff' }]} key={index}>
              <View style={{ flex: 1 }}>
                <Text style={styles.transactionDate}>
                  {formatRelativeDate(item?.date)}
                </Text>
                <Text style={[styles.transactionTitle, { color: '#000' }]}>
                  {item?.title || item?.values?.transferTitle || 'No Title'}
                </Text>
                {item?.values?.recipientName && (
                  <Text style={styles.transactionSubtitle}>
                    {item?.values?.recipientName}
                  </Text>
                )}
              </View>

              <View style={{ justifyContent: 'center' }}>
                <Text style={[styles.transactionAmount, { color: item?.credited ? '#222' : '#fa575e' }]}>
                  {item?.credited ? '+' : '-'}{item?.finalAmount} PLN
                </Text>
              </View>
            </View>
          );
        })}


{/* {
  sortedTransactions && sortedTransactions?.length > 6 &&
        (<TouchableOpacity onPress={handleHistory} style={{ backgroundColor: "#5e5498", padding: 10, borderRadius: 10, margin: 10, alignItems: "center", justifyContent: "center", width: "50%", alignSelf: "center" }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Historia przelewów</Text>
        </TouchableOpacity>)
} */}

{
  sortedTransactions && sortedTransactions?.length > 6 &&
        (<TouchableOpacity onPress={handleHistory} style={{ backgroundColor: "#5e5498", padding: 10, borderRadius: 10, margin: 10, alignItems: "center", justifyContent: "center", width: "50%", alignSelf: "center" }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Pełna historia</Text>
        </TouchableOpacity>)
}

      </ScrollView>
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
    borderBottomColor: '#222',
    backgroundColor: '#2b343b',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    // elevation: 1,
    paddingHorizontal: 10
  },
  headerCard: {
    width: width - 22,
    marginHorizontal: 6,
    marginVertical: 18,
    backgroundColor: '#5e5498',
    borderRadius: 22,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
    height: 180,
  },
  sliderDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 2,
    marginLeft: "auto"
  },
  sliderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bbb',
    marginHorizontal: 4,
  },
  sliderDotActive: {
    backgroundColor: '#5e5498',
    width: 18,
  },
  accountName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  accountNumber: {
    color: '#fff',
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  accountDetails: {
    color: '#fff',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 2,
    textAlign: "right"
  },
  balanceValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  settingsIcon: {
    // padding: 6,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 8,
    marginTop: 18,
    padding: 12,
    // shadowColor: '#000',
    // shadowOpacity: 0.10,
    // shadowRadius: 4,
    // elevation: 3,
    zIndex: 2,
  },
  quickActionBtn: {
    alignItems: 'center',
    flex: 1,
    borderRadius: 100,
    // padding: 12,

  },
  quickActionBtnicons: {
    backgroundColor: 'black',
    borderRadius: 100,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 3,
    color: "#fff"
  },

  quickActionLabel: {
    fontSize: 12,
    color: '#222',
    marginTop: 6,
    textAlign: 'center',
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 18,
  },
  historyHeader: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginHorizontal: 8,
    marginBottom: 8,
    // borderRadius: 8,
    // borderWidth: 1,
    // borderColor: '#eee',
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#000',
  },
  transactionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
