import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, theme } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PrayerCard = ({ prayer, isNext, showBorder = true, onPress }) => {
  const getPrayerColor = () => {
    if (prayer.hasPassed) {
      return colors.textTertiary;
    }
    if (isNext) {
      return colors.islamicGold;
    }
    return colors.textPrimary;
  };

  const getPrayerIcon = () => {
    const icons = {
      Fajr: 'sunrise',
      Sunrise: 'weather-sunny',
      Dhuhr: 'sun-compass',
      Asr: 'weather-partly-cloudy',
      Maghrib: 'weather-sunset',
      Isha: 'weather-night',
    };
    return icons[prayer.name] || 'clock';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        showBorder && styles.border,
        isNext && styles.nextPrayerContainer,
        prayer.hasPassed && styles.passedPrayerContainer,
      ]}
      disabled={!onPress}
    >
      <View style={styles.iconContainer}>
        <Icon name={getPrayerIcon()} size={20} color={getPrayerColor()} />
      </View>
      
      <View style={styles.infoContainer}>
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
          <Icon name="chevron-right" size={16} color={colors.islamicGold} />
        </View>
      )}
      
      {prayer.hasPassed && (
        <View style={styles.passedIndicator}>
          <Icon name="check" size={16} color={colors.success} />
        </View>
      )}
    </TouchableOpacity>
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
  },
  border: {
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  nextPrayerContainer: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
    borderWidth: 1,
  },
  passedPrayerContainer: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContainer: {
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
    marginLeft: 12,
  },
  passedIndicator: {
    marginLeft: 12,
  },
});

export default PrayerCard;
