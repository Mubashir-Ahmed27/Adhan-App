import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, theme } from '../utils/theme';
import { PRAYER_ARABIC_NAMES } from '../utils/constants';

const PrayerTimeItem = ({ prayer, isNext = false }) => {
  const getPrayerColor = () => {
    if (prayer.hasPassed) {
      return colors.textTertiary;
    }
    if (isNext) {
      return colors.islamicGold;
    }
    return colors.textPrimary;
  };

  return (
    <View style={[styles.container, prayer.hasPassed && styles.passedContainer]}>
      <View style={styles.nameContainer}>
        <Text style={[styles.prayerName, { color: getPrayerColor() }]}>
          {prayer.displayName}
        </Text>
        {prayer.arabicName && (
          <Text style={styles.prayerArabic}>{prayer.arabicName}</Text>
        )}
      </View>
      
      <View style={styles.timeContainer}>
        <Text style={[styles.prayerTime, { color: getPrayerColor() }]}>
          {prayer.time}
        </Text>
        {prayer.timeUntil && !prayer.hasPassed && (
          <Text style={styles.timeUntil}>{prayer.timeUntil}</Text>
        )}
      </View>
      
      {isNext && (
        <View style={styles.nextIndicator}>
          <Text style={styles.nextText}>NEXT</Text>
        </View>
      )}
      
      {prayer.hasPassed && (
        <View style={styles.passedIndicator}>
          <Text style={styles.passedText}>PASSED</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  passedContainer: {
    opacity: 0.6,
  },
  nameContainer: {
    flex: 1,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  prayerArabic: {
    fontSize: 12,
    color: colors.islamicGold,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  timeContainer: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  timeUntil: {
    fontSize: 10,
    color: colors.textTertiary,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  nextIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.islamicGold + '20',
    borderRadius: 4,
  },
  nextText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.islamicGold,
    fontFamily: 'Poppins-Bold',
  },
  passedIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.success + '20',
    borderRadius: 4,
  },
  passedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.success,
    fontFamily: 'Poppins-Bold',
  },
});

export default PrayerTimeItem;
