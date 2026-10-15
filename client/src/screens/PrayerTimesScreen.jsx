import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { usePrayer } from '../context/PrayerContext';
import { useLocation } from '../context/LocationContext';
import { colors, theme } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PrayerTimeItem from '../components/PrayerTimeItem';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorDisplay from '../components/ErrorDisplay';
import { PRAYER_METHODS, PRAYER_ORDER } from '../utils/constants';
import Modal from 'react-native-modal';
import PrayerMethodSelector from '../components/PrayerMethodSelector';

const PrayerTimesScreen = ({ navigation }) => {
  const { 
    prayerTimes, 
    todayPrayers, 
    isLoading, 
    error, 
    location,
    prayerMethod,
    refreshPrayerTimes,
    changePrayerMethod
  } = usePrayer();
  
  const { getCurrentLocation, requestPermissions } = useLocation();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Refresh data
  const refreshData = async () => {
    try {
      setRefreshing(true);
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

  const handleMethodChange = async (method) => {
    await changePrayerMethod(method);
    setShowMethodModal(false);
  };

  const handleDateChange = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    // Note: For date changes, we would need to fetch prayer times for that date
    // This is a placeholder for now
  };

  const renderPrayerItem = ({ item }) => (
    <PrayerTimeItem
      prayer={item}
      isNext={item.isNext}
    />
  );

  // Refresh on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshData();
    });
    
    return unsubscribe;
  }, [navigation]);

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
          <Text style={styles.title}>Prayer Times</Text>
          
          <TouchableOpacity
            onPress={() => setShowMethodModal(true)}
            style={styles.methodButton}
          >
            <Icon name="calendar-settings" size={20} color={colors.textSecondary} />
            <Text style={styles.methodButtonText}>
              Method: {PRAYER_METHODS[prayerMethod] || prayerMethod}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location Info */}
        <View style={styles.locationInfo}>
          <Icon name="map-marker" size={20} color={colors.primary} />
          <Text style={styles.locationText}>
            {location?.city}, {location?.country}
          </Text>
        </View>

        {/* Date Navigation */}
        <View style={styles.dateNavigator}>
          <TouchableOpacity
            onPress={() => handleDateChange(-1)}
            style={[styles.dateButton, !prayerTimes && styles.dateButtonDisabled]}
            disabled={!prayerTimes}
          >
            <Icon name="chevron-left" size={24} color={prayerTimes ? colors.textPrimary : colors.textTertiary} />
          </TouchableOpacity>
          
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          
          <TouchableOpacity
            onPress={() => handleDateChange(1)}
            style={[styles.dateButton, !prayerTimes && styles.dateButtonDisabled]}
            disabled={!prayerTimes}
          >
            <Icon name="chevron-right" size={24} color={prayerTimes ? colors.textPrimary : colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Hijri Date */}
        {prayerTimes?.hijriDate && (
          <View style={styles.hijriDateContainer}>
            <Icon name="calendar-islamic" size={16} color={colors.islamicGold} />
            <Text style={styles.hijriDateText}>
              {prayerTimes.hijriDate.day} {prayerTimes.hijriDate.month.en} {prayerTimes.hijriDate.year} AH
            </Text>
          </View>
        )}

        {/* Error Display */}
        {error && <ErrorDisplay message={error} onRetry={refreshData} />}

        {/* Prayer Times List */}
        <View style={styles.prayerListContainer}>
          {todayPrayers && todayPrayers.length > 0 ? (
            <FlatList
              data={todayPrayers}
              renderItem={renderPrayerItem}
              keyExtractor={(item) => item.name}
              scrollEnabled={false}
            />
          ) : (
            !isLoading && (
              <View style={styles.emptyState}>
                <Icon name="clock-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No prayer times available</Text>
                <Text style={styles.emptySubtext}>Pull down to refresh</Text>
              </View>
            )
          )}
        </View>

        {/* Additional Info Section */}
        <View style={styles.additionalInfo}>
          <Text style={styles.infoTitle}>Prayer Method Information</Text>
          <Text style={styles.infoText}>
            {PRAYER_METHODS[prayerMethod] || 'Islamic Society of North America (ISNA)'}
          </Text>
          <Text style={styles.infoSubtext}>
            Calculation method used for prayer times
          </Text>
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
        animationInTiming={300}
        animationOutTiming={200}
        backdropTransitionInTiming={200}
        backdropTransitionOutTiming={200}
      >
        <View style={styles.modalContent}>
          <PrayerMethodSelector
            currentMethod={prayerMethod}
            onSelect={handleMethodChange}
            onCancel={() => setShowMethodModal(false)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    fontFamily: 'Poppins-Bold',
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  methodButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  locationText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 10,
    fontFamily: 'Poppins-Regular',
  },
  dateNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  dateButton: {
    padding: 8,
    borderRadius: 8,
  },
  dateButtonDisabled: {
    opacity: 0.5,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  hijriDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderDark,
    justifyContent: 'center',
  },
  hijriDateText: {
    fontSize: 14,
    color: colors.islamicGold,
    marginLeft: 8,
    fontFamily: 'Poppins-Medium',
  },
  prayerListContainer: {
    marginBottom: 20,
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
  additionalInfo: {
    padding: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  infoSubtext: {
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

export default PrayerTimesScreen;
