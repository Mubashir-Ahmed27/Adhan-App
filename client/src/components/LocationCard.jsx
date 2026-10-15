import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, theme } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LocationCard = ({ location, onPress, isActive = false, showChevron = false }) => {
  const getLocationText = () => {
    if (location.displayName) {
      return location.displayName;
    }
    
    if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    }
    
    if (location.latitude && location.longitude) {
      return `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`;
    }
    
    return 'Location';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        isActive && styles.activeContainer,
      ]}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
        <Icon name="map-marker" size={20} color={isActive ? '#ffffff' : colors.primary} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.locationName, isActive && styles.activeLocationName]}>
          {getLocationText()}
        </Text>
        {location.city && location.country && (
          <Text style={styles.locationDetails}>
            {location.city}, {location.country}
          </Text>
        )}
      </View>
      
      {showChevron && onPress && (
        <View style={styles.chevronContainer}>
          <Icon name="chevron-right" size={20} color={colors.textTertiary} />
        </View>
      )}
      
      {isActive && (
        <View style={styles.activeBadge}>
          <Icon name="check" size={12} color="#ffffff" />
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
    marginBottom: 10,
  },
  activeContainer: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
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
  activeIconContainer: {
    backgroundColor: colors.primary,
  },
  textContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Poppins-SemiBold',
  },
  activeLocationName: {
    color: colors.primary,
  },
  locationDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  chevronContainer: {
    padding: 8,
  },
  activeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default LocationCard;
