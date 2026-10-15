import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { usePrayer } from '../context/PrayerContext';
import { colors, theme } from '../utils/theme';
import { PRAYER_METHODS, THEME_OPTIONS, LANGUAGE_OPTIONS, NOTIFICATION_SETTINGS } from '../utils/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SettingItem from '../components/SettingItem';
import Modal from 'react-native-modal';
import PrayerMethodSelector from '../components/PrayerMethodSelector';
import ThemeSelector from '../components/ThemeSelector';
import LanguageSelector from '../components/LanguageSelector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

const SettingsScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { prayerMethod, changePrayerMethod } = usePrayer();
  
  const [themeMode, setThemeMode] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [notificationSettings, setNotificationSettings] = useState({
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    beforeMinutes: NOTIFICATION_SETTINGS.defaultBeforeMinutes,
  });
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.theme);
        const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.language);
        const savedNotifications = await AsyncStorage.getItem(STORAGE_KEYS.notificationSettings);
        
        if (savedTheme) setThemeMode(savedTheme);
        if (savedLanguage) setLanguage(savedLanguage);
        if (savedNotifications) setNotificationSettings(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Save theme setting
  const handleThemeChange = async (mode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem(STORAGE_KEYS.theme, mode);
      setShowThemeModal(false);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Save language setting
  const handleLanguageChange = async (lang) => {
    try {
      setLanguage(lang);
      await AsyncStorage.setItem(STORAGE_KEYS.language, lang);
      setShowLanguageModal(false);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // Handle prayer method change
  const handleMethodChange = async (method) => {
    await changePrayerMethod(method);
    setShowMethodModal(false);
  };

  // Handle notification setting change
  const handleNotificationChange = async (prayer, value) => {
    try {
      const newSettings = { ...notificationSettings, [prayer]: value };
      setNotificationSettings(newSettings);
      await AsyncStorage.setItem(STORAGE_KEYS.notificationSettings, JSON.stringify(newSettings));
      
      // Update user profile if authenticated
      if (isAuthenticated && user) {
        await updateProfile({ notificationSettings: newSettings });
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  // Handle before minutes change
  const handleBeforeMinutesChange = async (value) => {
    try {
      const newSettings = { ...notificationSettings, beforeMinutes: Math.max(1, Math.min(60, value)) };
      setNotificationSettings(newSettings);
      await AsyncStorage.setItem(STORAGE_KEYS.notificationSettings, JSON.stringify(newSettings));
      
      if (isAuthenticated && user) {
        await updateProfile({ notificationSettings: newSettings });
      }
    } catch (error) {
      console.error('Error saving notification time:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      setIsLoading(false);
      navigation.navigate('Auth', { screen: 'Login' });
    } catch (error) {
      console.error('Error logging out:', error);
      setIsLoading(false);
    }
  };

  // Navigate to profile
  const handleProfilePress = () => {
    if (isAuthenticated) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('Auth', { screen: 'Login' });
    }
  };

  // Navigate to location settings
  const handleLocationPress = () => {
    navigation.navigate('Location');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your Adhan App experience</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingItem
            icon="account"
            title="Profile"
            subtitle={isAuthenticated ? user?.name || user?.email : 'Not logged in'}
            onPress={handleProfilePress}
            showChevron
          />
          
          {isAuthenticated && (
            <SettingItem
              icon="logout"
              title="Logout"
              subtitle="Sign out of your account"
              onPress={handleLogout}
              showChevron={false}
              disabled={isLoading}
            />
          )}
        </View>

        {/* Prayer Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prayer Settings</Text>
          
          <SettingItem
            icon="calendar-settings"
            title="Prayer Calculation Method"
            subtitle={PRAYER_METHODS[prayerMethod] || `Method ${prayerMethod}`}
            onPress={() => setShowMethodModal(true)}
            showChevron
          />
          
          <SettingItem
            icon="map-marker"
            title="Location Settings"
            subtitle={isAuthenticated ? 'Manage your saved locations' : 'Set your location for prayer times'}
            onPress={handleLocationPress}
            showChevron
          />
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <SettingItem
            icon="theme-light-dark"
            title="Theme"
            subtitle={THEME_OPTIONS.find(opt => opt.value === themeMode)?.label || themeMode}
            onPress={() => setShowThemeModal(true)}
            showChevron
          />
          
          <SettingItem
            icon="translate"
            title="Language"
            subtitle={LANGUAGE_OPTIONS.find(opt => opt.value === language)?.label || language}
            onPress={() => setShowLanguageModal(true)}
            showChevron
          />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <Text style={styles.notificationInfo}>
            Get notified before each prayer time
          </Text>
          
          {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(prayer => (
            <View key={prayer} style={styles.notificationItem}>
              <Text style={styles.notificationPrayerName}>
                {prayer.charAt(0).toUpperCase() + prayer.slice(1)}
              </Text>
              <Switch
                value={notificationSettings[prayer]}
                onValueChange={(value) => handleNotificationChange(prayer, value)}
                trackColor={{ false: colors.textTertiary, true: colors.primary }}
                thumbColor={notificationSettings[prayer] ? colors.primary : colors.textTertiary}
                ios_backgroundColor={colors.textTertiary}
              />
            </View>
          ))}
          
          <View style={styles.notificationTimeContainer}>
            <Text style={styles.notificationTimeLabel}>Notify me before:</Text>
            <View style={styles.notificationTimeButtons}>
              {[10, 15, 20, 30].map(minutes => (
                <TouchableOpacity
                  key={minutes}
                  onPress={() => handleBeforeMinutesChange(minutes)}
                  style={[
                    styles.notificationTimeButton,
                    notificationSettings.beforeMinutes === minutes && styles.notificationTimeButtonActive
                  ]}
                >
                  <Text style={[
                    styles.notificationTimeButtonText,
                    notificationSettings.beforeMinutes === minutes && styles.notificationTimeButtonTextActive
                  ]}>
                    {minutes} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <SettingItem
            icon="information"
            title="About Adhan App"
            subtitle="Islamic Prayer Times Tracker"
            onPress={() => navigation.navigate('Home')}
            showChevron
          />
          
          <SettingItem
            icon="star"
            title="Rate the App"
            subtitle="Help us improve"
            onPress={() => {}}
            showChevron
          />
          
          <SettingItem
            icon="share"
            title="Share the App"
            subtitle="Spread the word"
            onPress={() => {}}
            showChevron
          />
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Prayer Method Modal */}
      <Modal
        isVisible={showMethodModal}
        onBackdropPress={() => setShowMethodModal(false)}
        onSwipeComplete={() => setShowMethodModal(false)}
        swipeDirection={['down']}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContent}>
          <PrayerMethodSelector
            currentMethod={prayerMethod}
            onSelect={handleMethodChange}
            onCancel={() => setShowMethodModal(false)}
          />
        </View>
      </Modal>

      {/* Theme Modal */}
      <Modal
        isVisible={showThemeModal}
        onBackdropPress={() => setShowThemeModal(false)}
        onSwipeComplete={() => setShowThemeModal(false)}
        swipeDirection={['down']}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContent}>
          <ThemeSelector
            currentTheme={themeMode}
            onSelect={handleThemeChange}
            onCancel={() => setShowThemeModal(false)}
          />
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal
        isVisible={showLanguageModal}
        onBackdropPress={() => setShowLanguageModal(false)}
        onSwipeComplete={() => setShowLanguageModal(false)}
        swipeDirection={['down']}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContent}>
          <LanguageSelector
            currentLanguage={language}
            onSelect={handleLanguageChange}
            onCancel={() => setShowLanguageModal(false)}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  notificationInfo: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  notificationPrayerName: {
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: 'Poppins-Regular',
  },
  notificationTimeContainer: {
    marginTop: 16,
    padding: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  notificationTimeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },
  notificationTimeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationTimeButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderDark,
    alignItems: 'center',
  },
  notificationTimeButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  notificationTimeButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  notificationTimeButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    fontSize: 12,
    color: colors.textTertiary,
    fontFamily: 'Poppins-Regular',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default SettingsScreen;
