import * as Location from 'expo-location';
import { locationApi, osmService } from './api';
import { DEFAULT_LOCATION } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

class LocationService {
  // Request location permissions
  static async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  // Check if location permissions are granted
  static async checkPermissions() {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return false;
    }
  }

  // Get current location
  static async getCurrentLocation() {
    try {
      // Check permissions
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          return DEFAULT_LOCATION;
        }
      }
      
      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
        maximumAge: 60000,
      });
      
      const { latitude, longitude } = location.coords;
      
      // Reverse geocode to get city and country
      const address = await this.reverseGeocode(latitude, longitude);
      
      // Save as default location
      await this.saveDefaultLocation({
        latitude,
        longitude,
        city: address.city,
        country: address.country,
      });
      
      return {
        latitude,
        longitude,
        city: address.city,
        country: address.country,
        formatted: address.formatted,
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Return default location
      return DEFAULT_LOCATION;
    }
  }

  // Watch position changes
  static async watchPosition(callback) {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          return null;
        }
      }
      
      return Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 60000, // 1 minute
          distanceInterval: 100, // 100 meters
        },
        callback
      );
    } catch (error) {
      console.error('Error watching position:', error);
      return null;
    }
  }

  // Reverse geocode coordinates to address
  static async reverseGeocode(latitude, longitude, zoom = 10) {
    try {
      // Try API first
      const response = await locationApi.reverseGeocode({
        latitude,
        longitude,
        zoom,
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      
      // Fallback to direct OSM API
      const fallbackResponse = await osmService.reverseGeocode(latitude, longitude, zoom);
      const address = fallbackResponse.data.address || {};
      
      return {
        formatted: fallbackResponse.data.display_name || '',
        city: address.city || address.town || address.village || address.hamlet || '',
        country: address.country || '',
        state: address.state || '',
        road: address.road || '',
        suburb: address.suburb || '',
        postalCode: address.postcode || '',
        latitude,
        longitude,
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return {
        formatted: '',
        city: '',
        country: '',
        latitude,
        longitude,
      };
    }
  }

  // Search for locations by name
  static async searchLocations(query, limit = 10) {
    try {
      const response = await locationApi.searchLocations({
        query,
        limit,
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      
      // Fallback to direct OSM API
      const fallbackResponse = await osmService.search(query, limit);
      return fallbackResponse.data.map(item => ({
        placeId: item.place_id,
        displayName: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        city: item.address.city || item.address.town || item.address.village || '',
        country: item.address.country || '',
        state: item.address.state || '',
        type: item.type,
      }));
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    }
  }

  // Save default location
  static async saveDefaultLocation(location) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.defaultLocation,
        JSON.stringify(location)
      );
    } catch (error) {
      console.error('Error saving default location:', error);
    }
  }

  // Get default location
  static async getDefaultLocation() {
    try {
      const location = await AsyncStorage.getItem(STORAGE_KEYS.defaultLocation);
      return location ? JSON.parse(location) : DEFAULT_LOCATION;
    } catch (error) {
      console.error('Error getting default location:', error);
      return DEFAULT_LOCATION;
    }
  }

  // Remove default location
  static async removeDefaultLocation() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.defaultLocation);
    } catch (error) {
      console.error('Error removing default location:', error);
    }
  }

  // Get nearby locations
  static async getNearbyLocations(latitude, longitude, radius = 10, limit = 10) {
    try {
      const response = await locationApi.getNearbyLocations({
        latitude,
        longitude,
        radius,
        limit,
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting nearby locations:', error);
      return [];
    }
  }

  // Calculate distance between two coordinates (in km)
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Convert degrees to radians
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Get location from IP (fallback method)
  static async getLocationFromIP() {
    try {
      const response = await locationApi.getCurrentLocation();
      if (response.data.success) {
        return response.data.data;
      }
      
      // This is a placeholder - IP geolocation requires a third-party service
      return DEFAULT_LOCATION;
    } catch (error) {
      console.error('Error getting location from IP:', error);
      return DEFAULT_LOCATION;
    }
  }

  // Check if location services are enabled
  static async isLocationEnabled() {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  // Open location settings
  static async openLocationSettings() {
    try {
      await Location.requestForegroundPermissionsAsync();
    } catch (error) {
      console.error('Error opening location settings:', error);
    }
  }
}

export default LocationService;
