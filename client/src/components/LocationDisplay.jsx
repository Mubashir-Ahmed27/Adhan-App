import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, theme } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LocationDisplay = ({ location, onPress, showChevron = true }) => {
  const getLocationText = () => {
    if (!location) {
      return 'Location not set';
    }
    
    if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    }
    
    if (location.latitude && location.longitude) {
      return `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`;
    }
    
    return 'Location not available';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      disabled={!onPress}
    >
      <View style={styles.iconContainer}>
        <Icon name="map-marker" size={20} color={colors.primary} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.locationLabel}>Current Location</Text>
        <Text style={styles.locationText} numberOfLines={1}>
          {getLocationText()}
        </Text>
      </View>
      
      {showChevron && onPress && (
        <View style={styles.chevronContainer}>
          <Icon name="chevron-right" size={20} color={colors.textTertiary} />
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
    borderWidth: 1,
    borderColor: colors.borderDark,
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    fontFamily: 'Poppins-Regular',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Poppins-SemiBold',
  },
  chevronContainer: {
    padding: 8,
  },
});

export default LocationDisplay;
