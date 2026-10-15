import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl } from 'react-native';
import { useLocation } from '../context/LocationContext';
import { usePrayer } from '../context/PrayerContext';
import { colors, theme } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorDisplay from '../components/ErrorDisplay';
import LocationCard from '../components/LocationCard';
import { DEFAULT_LOCATION } from '../utils/constants';

const LocationScreen = ({ navigation }) => {
  const { 
    currentLocation, 
    defaultLocation, 
    isLoading, 
    error, 
    hasPermission,
    isLocationEnabled,
    getCurrentLocation,
    requestPermissions,
    searchLocations,
    setDefaultLocation,
    reverseGeocode,
    clearError
  } = useLocation();
  
  const { changeLocation, location: prayerLocation } = usePrayer();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await requestPermissions();
      await getCurrentLocation();
      setRefreshing(false);
    } catch (error) {
      console.error('Error refreshing location data:', error);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    await refreshData();
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    try {
      setIsSearching(true);
      const results = await searchLocations(query, 10);
      setSearchResults(results);
      setIsSearching(false);
    } catch (error) {
      console.error('Error searching locations:', error);
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = () => {
    handleSearch(searchQuery);
  };

  const handleLocationSelect = async (location) => {
    try {
      // Set as current and default location
      await setDefaultLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        city: location.city,
        country: location.country,
      });
      
      // Update prayer context
      await changeLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        city: location.city,
        country: location.country,
      });
      
      setSearchQuery('');
      setSearchResults([]);
      setIsSearching(false);
      
      navigation.goBack();
    } catch (error) {
      console.error('Error selecting location:', error);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      const hasPermission = await requestPermissions();
      
      if (hasPermission) {
        const location = await getCurrentLocation();
        if (location) {
          await setDefaultLocation(location);
          await changeLocation(location);
        }
      }
    } catch (error) {
      console.error('Error using current location:', error);
    }
  };

  const handleUseDefaultLocation = async () => {
    try {
      await changeLocation(defaultLocation);
      navigation.goBack();
    } catch (error) {
      console.error('Error using default location:', error);
    }
  };

  const handleUseMeccaLocation = async () => {
    try {
      const meccaLocation = {
        latitude: 21.4225,
        longitude: 39.8262,
        city: 'Mecca',
        country: 'Saudi Arabia',
      };
      
      await setDefaultLocation(meccaLocation);
      await changeLocation(meccaLocation);
      navigation.goBack();
    } catch (error) {
      console.error('Error using Mecca location:', error);
    }
  };

  const renderSearchResult = ({ item }) => (
    <LocationCard
      location={item}
      onPress={() => handleLocationSelect(item)}
      showChevron
    />
  );

  const renderQuickLocation = (title, subtitle, onPress) => (
    <TouchableOpacity onPress={onPress} style={styles.quickLocationCard}>
      <View style={styles.quickLocationIcon}>
        <Icon name="target" size={24} color={colors.primary} />
      </View>
      <View style={styles.quickLocationText}>
        <Text style={styles.quickLocationTitle}>{title}</Text>
        <Text style={styles.quickLocationSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

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
          <Text style={styles.title}>Location Settings</Text>
          <Text style={styles.subtitle}>Set your location for accurate prayer times</Text>
        </View>

        {/* Error Display */}
        {error && <ErrorDisplay message={error} onRetry={refreshData} />}

        {/* Current Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          
          {isLoading ? (
            <LoadingIndicator />
          ) : (
            <View style={styles.currentLocationContainer}>
              {currentLocation ? (
                <LocationCard
                  location={currentLocation}
                  onPress={handleUseCurrentLocation}
                  isActive
                />
              ) : (
                <View style={styles.emptyLocation}>
                  <Icon name="map-marker-off" size={48} color={colors.textTertiary} />
                  <Text style={styles.emptyText}>Location not available</Text>
                  <Text style={styles.emptySubtext}>
                    {hasPermission === false ? 'Enable location permissions to use this feature' : 'Location services may be disabled'}
                  </Text>
                  
                  {hasPermission === false && (
                    <TouchableOpacity
                      onPress={requestPermissions}
                      style={styles.enableButton}
                    >
                      <Text style={styles.enableButtonText}>Enable Permissions</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Quick Location Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Locations</Text>
          
          {renderQuickLocation(
            'Use Current Location',
            'Get prayer times for your current position',
            handleUseCurrentLocation
          )}
          
          {renderQuickLocation(
            'Use Default Location',
            `${defaultLocation.city}, ${defaultLocation.country}`,
            handleUseDefaultLocation
          )}
          
          {renderQuickLocation(
            'Use Mecca (Kaaba)',
            'Get prayer times for Mecca, Saudi Arabia',
            handleUseMeccaLocation
          )}
        </View>

        {/* Search Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search for a Location</Text>
          
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon name="magnify" size={20} color={colors.textTertiary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a city or country..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsSearching(false);
                  }}
                  style={styles.clearButton}
                >
                  <Icon name="close-circle" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Search Results */}
          {isSearching ? (
            <LoadingIndicator />
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.placeId || `${item.latitude}-${item.longitude}`}
              scrollEnabled={false}
            />
          ) : searchQuery.length > 0 ? (
            <View style={styles.noResults}>
              <Icon name="magnify-close" size={32} color={colors.textTertiary} />
              <Text style={styles.noResultsText}>No locations found</Text>
              <Text style={styles.noResultsSubtext}>Try a different search term</Text>
            </View>
          ) : null}
        </View>

        {/* Permission Status */}
        {!isLocationEnabled && (
          <View style={styles.warningContainer}>
            <Icon name="alert-circle" size={20} color={colors.warning} />
            <Text style={styles.warningText}>
              Location services are disabled on your device. 
              Prayer times may not be accurate.
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
  currentLocationContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
    overflow: 'hidden',
  },
  emptyLocation: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
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
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 20,
  },
  enableButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  enableButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  quickLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  quickLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickLocationText: {
    flex: 1,
  },
  quickLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
    fontFamily: 'Poppins-SemiBold',
  },
  quickLocationSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: 'Poppins-Regular',
  },
  clearButton: {
    padding: 8,
  },
  noResults: {
    alignItems: 'center',
    padding: 30,
  },
  noResultsText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    fontFamily: 'Poppins-Regular',
  },
  noResultsSubtext: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.warning + '20',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.warning,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: colors.warning,
    marginLeft: 10,
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default LocationScreen;
