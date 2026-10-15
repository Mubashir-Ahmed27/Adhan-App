import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import PrayerTimesScreen from './src/screens/PrayerTimesScreen';
import LocationScreen from './src/screens/LocationScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Import context providers
import { AuthProvider } from './src/context/AuthContext';
import { PrayerProvider } from './src/context/PrayerContext';
import { LocationProvider } from './src/context/LocationContext';

// Import custom components
import TabBar from './src/components/TabBar';

// Import theme
import { theme } from './src/utils/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: 'home'
        }}
      />
      <Tab.Screen
        name="PrayerTimes"
        component={PrayerTimesScreen}
        options={{
          tabBarLabel: 'Prayer Times',
          tabBarIcon: 'clock'
        }}
      />
      <Tab.Screen
        name="Location"
        component={LocationScreen}
        options={{
          tabBarLabel: 'Location',
          tabBarIcon: 'map-marker'
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: 'cog'
        }}
      />
    </Tab.Navigator>
  );
}

// Authentication Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Main App Component
function AppContent() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Poppins-Regular': require('@expo-google-fonts/poppins/Poppins_400Regular.ttf'),
          'Poppins-Medium': require('@expo-google-fonts/poppins/Poppins_500Medium.ttf'),
          'Poppins-SemiBold': require('@expo-google-fonts/poppins/Poppins_600SemiBold.ttf'),
          'Poppins-Bold': require('@expo-google-fonts/poppins/Poppins_700Bold.ttf'),
          'Inter-Regular': require('@expo-google-fonts/inter/Inter_400Regular.ttf'),
          'Inter-Medium': require('@expo-google-fonts/inter/Inter_500Medium.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <PrayerProvider>
          <LocationProvider>
            <SafeAreaProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <NavigationContainer>
                  <StatusBar
                    style="light"
                    backgroundColor={theme.colors.background}
                    translucent={false}
                  />
                  <Stack.Navigator
                    screenOptions={{
                      headerShown: false,
                      animation: 'fade',
                      contentStyle: { backgroundColor: theme.colors.background }
                    }}
                  >
                    <Stack.Screen name="Auth" component={AuthStack} />
                    <Stack.Screen name="Main" component={MainTabs} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                  </Stack.Navigator>
                </NavigationContainer>
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </LocationProvider>
        </PrayerProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

export default function App() {
  return <AppContent />;
}
