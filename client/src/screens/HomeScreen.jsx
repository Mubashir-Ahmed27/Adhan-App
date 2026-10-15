import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { usePrayer } from '../context/PrayerContext';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../utils/theme';
import { PRAYER_DISPLAY_NAMES, PRAYER_ARABIC_NAMES } from '../utils/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PrayerCard from '../components/PrayerCard';
import CountdownDisplay from '../components/CountdownDisplay';
import LocationDisplay from '../components/LocationDisplay';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorDisplay from '../components/ErrorDisplay';

const HomeScreen = ({ navigation }) => {
  const { 
    prayerTimes, 
    todayPrayers, 
    nextPrayer, 
    countdown, 
    isLoading, 
    error, 
    refreshPrayerTimes,
    getCountdown
  } = usePrayer();
  
  const { currentLocation, getCurrentLocation, requestPermissions } = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);

  // Refresh data on screen focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshData();
    });
    
    return unsubscribe;
  }, [navigation]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      setRefreshing(true);
      
      // Check if we have location permission
      const hasPermission = await requestPermissions();
      
      if (hasPermission) {
        await getCurrentLocation();
      }
      
      await refreshPrayerTimes();
      
      setRefreshing(false);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    await refreshData();
  };

  const handleLocationPress = async () => {
    navigation.navigate('Location');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleProfilePress = () => {
    if (isAuthenticated) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('Auth', { screen: 'Login' });
    }
  };

  const getCountdownStyle = () => {
    const countdownObj = getCountdown();
    
    if (countdownObj.isCritical) {
      return styles.countdownCritical;
    } else if (countdownObj.isWarning) {
      return styles.countdownWarning;
    }
    return styles.countdownNormal;
  };

  if (isLoading && !prayerTimes) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleSettingsPress} style={styles.headerButton}>
              <Icon name="cog" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerCenter}>
            <Text style={styles.appName}>Adhan App</Text>
            <Text style={styles.appSubtitle}>Prayer Times Tracker</Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleProfilePress} style={styles.headerButton}>
              <Icon name={isAuthenticated ? "account" : "account-outline"} size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Display */}
        <LocationDisplay
          location={currentLocation}
          onPress={handleLocationPress}
        />

        {/* Countdown Section */}
        <View style={styles.countdownSection}>
          <Text style={styles.nextPrayerLabel}>Next Prayer:</Text>
          <Text style={[styles.nextPrayerName, getCountdownStyle()]}>
            {nextPrayer?.displayName || 'Loading...'}
          </Text>
          <Text style={styles.nextPrayerArabic}>
            {nextPrayer?.arabicName || ''}
          </Text>
          <CountdownDisplay
            countdown={countdown}
            style={[styles.countdownText, getCountdownStyle()]}
          />
        </View>

        {/* Prayer Times List */}
        <View style={styles.prayerTimesContainer}>
          <Text style={styles.sectionTitle}>Today's Prayer Times</Text>
          
          {error && <ErrorDisplay message={error} onRetry={refreshData} />}
          
          {todayPrayers && todayPrayers.length > 0 ? (
            todayPrayers.map((prayer, index) => (
              <PrayerCard
                key={prayer.name}
                prayer={prayer}
                isNext={prayer.isNext}
                showBorder={index < todayPrayers.length - 1}
              />
            ))
          ) : (
            !isLoading && (
              <View style={styles.emptyState}>
                <Icon name="clock-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No prayer times available</Text>
                <Text style={styles.emptySubtext}>Tap refresh to try again</Text>
              </View>
            )
          )}
        </View>

        {/* Date Display */}
        <View style={styles.dateContainer}>
          <Icon name="calendar" size={20} color={colors.textTertiary} />
          <Text style={styles.dateText}>
            {prayerTimes?.formattedDate || new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        {/* Hijri Date Display */}
        {prayerTimes?.hijriDate && (
          <View style={styles.hijriDateContainer}>
            <Icon name="calendar-islamic" size={20} color={colors.islamicGold} />
            <Text style={styles.hijriDateText}>
              {prayerTimes.hijriDate.day} {prayerTimes.hijriDate.month.en} {prayerTimes.hijriDate.year}
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    fontFamily: 'Poppins-Bold',
  },
  appSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  countdownSection: {
    alignItems: 'center',
    marginVertical: 30,
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  nextPrayerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
  },
  nextPrayerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  nextPrayerArabic: {
    fontSize: 20,
    color: colors.islamicGold,
    fontFamily: 'Poppins-Regular',
    marginBottom: 16,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  countdownNormal: {
    color: colors.countdownNormal,
  },
  countdownWarning: {
    color: colors.countdownWarning,
  },
  countdownCritical: {
    color: colors.countdownCritical,
  },
  prayerTimesContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    padding: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 10,
    fontFamily: 'Poppins-Regular',
  },
  hijriDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  hijriDateText: {
    fontSize: 14,
    color: colors.islamicGold,
    marginLeft: 10,
    fontFamily: 'Poppins-Medium',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    fontFamily: 'Poppins-Regular',
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default HomeScreen;
