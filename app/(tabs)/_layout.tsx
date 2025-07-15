import { Tabs } from 'expo-router';
import React from 'react';
import { Alert, Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Fontisto from '@expo/vector-icons/Fontisto';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const handleTabPress = (e: any, tabName: string) => {
    if (tabName === 'screen3' || tabName === 'screen4') {
      e.preventDefault();
      Alert.alert("Nie masz uprawnień dla tej funkcji");
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#5e5498',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            // paddingVertical: 20,
            backgroundColor: '#fff',
          },
          default: {
            // paddingTop: 30 ,
            // height: 60,
            backgroundColor: '#fff',
          },
        }),
      }}>
      <Tabs.Screen
        name="screen1"
        options={{
          title: 'Start',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
        listeners={{
          tabPress: (e) => handleTabPress(e, 'screen1')
        }}
      />
      <Tabs.Screen
        name="screen2"
        options={{
          title: 'Płatności',
          tabBarIcon: ({ color }) => <FontAwesome5 name="exchange-alt" size={24} color={color} />,
        }}
        listeners={{
          tabPress: (e) => handleTabPress(e, 'screen2')
        }}
      />
      <Tabs.Screen
        name="screen3"
        options={{
          title: 'Produkty',
          tabBarIcon: ({ color }) => <Fontisto name="credit-card" size={20} color={color} />,
        }}
        listeners={{
          tabPress: (e) => handleTabPress(e, 'screen3')
        }}
      />
      <Tabs.Screen
        name="screen4"
        options={{
          title: 'Produkty',
          tabBarIcon: ({ color }) =>  <Feather name="more-horizontal" size={20} color={color}    />,
        }}
        listeners={{
          tabPress: (e) => handleTabPress(e, 'screen4')
        }}
      />
    </Tabs>
  );
}
