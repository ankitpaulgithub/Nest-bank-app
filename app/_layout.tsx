import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Global error handler
const globalErrorHandler = (error: Error, isFatal?: boolean) => {
  console.error('Global Error Handler:', error);
  console.error('Error Stack:', error.stack);
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Set up global error handler and clear navigation state
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Clear any stored navigation state to ensure fresh start
        await AsyncStorage.removeItem('expo-router-last-url');
        await AsyncStorage.removeItem('expo-router-last-url-params');
        await AsyncStorage.removeItem('userAuthenticated');
        await AsyncStorage.removeItem('lastLoginTime');
        
        const originalErrorHandler = ErrorUtils.getGlobalHandler();
        ErrorUtils.setGlobalHandler((error, isFatal) => {
          globalErrorHandler(error, isFatal);
          originalErrorHandler(error, isFatal);
        });

        setIsReady(true);

        return () => {
          ErrorUtils.setGlobalHandler(originalErrorHandler);
        };
      } catch (err) {
        console.error('Error setting up global error handler:', err);
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  // Force redirect to login if not authenticated
  // useEffect(() => {
  //   if (isReady && segments.length > 0) {
  //     const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'admin';
  //     if (inAuthGroup) {
  //       // Redirect to login if trying to access protected routes
  //       router.replace('/');
  //     }
  //   }
  // }, [isReady, segments]);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#c7c5dc' }}>
        <Text style={{ fontSize: 16, color: '#5e5498' }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#c7c5dc' }}>
        <Text style={{ fontSize: 16, color: '#ff3b30', textAlign: 'center', padding: 20 }}>
          Error: {error}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View
        style={{
          flex: 1,
          backgroundColor: '#c7c5dc', // Replace this with your desired background color
        }}
      >
        {/* Transparent status bar like Blinkit */}
        <StatusBar
          translucent
          backgroundColor="transparent"
          style='dark'
        />
        {/* Navigation stack */}
        <ThemeProvider value={colorScheme === 'light' ? DefaultTheme : DarkTheme}>
          <Stack initialRouteName="index">
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="screen2" options={{ headerShown: false }} />
            <Stack.Screen name="screen3" options={{ headerShown: false }} />
            <Stack.Screen name="screen4" options={{ headerShown: false }} />
            <Stack.Screen name="start" options={{ headerShown: false }} />
            <Stack.Screen name="paymentsuccess" options={{ headerShown: false }} />
            <Stack.Screen name="otp" options={{ headerShown: false }} />
            <Stack.Screen name="errorscreen" options={{ headerShown: false }} />
            <Stack.Screen name="loadingcreen" options={{ headerShown: false }} />

            <Stack.Screen name="+not-found" />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </View>
    </SafeAreaProvider>
  );
}
