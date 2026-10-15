import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LocationService } from '../services';
import { DEFAULT_LOCATION } from '../utils/constants';
import * as Location from 'expo-location';

const LocationContext = createContext();

const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [defaultLocation, setDefaultLocation] = useState(DEFAULT_LOCATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(null);

  // Initialize location
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        setIsLoading(true);
        
        // Check if location services are enabled
        const enabled = await LocationService.isLocationEnabled();
        setIsLocationEnabled(enabled);
        
        // Check permissions
        const permission = await LocationService.checkPermissions();
        setHasPermission(permission);
        
        // Load default location from storage
        const storedLocation = await LocationService.getDefaultLocation();
        setDefaultLocation(storedLocation);
        
        // If we have permission, try to get current location
        if (permission) {
          const location = await LocationService.getCurrentLocation();
          setCurrentLocation(location);
        } else {
          setCurrentLocation(storedLocation);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing location:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    initializeLocation();
  }, []);

  // Request location permissions
  const requestPermissions = useCallback(async () => {
    try {
      const granted = await LocationService.requestPermissions();
      setHasPermission(granted);
      
      if (granted) {
        const location = await LocationService.getCurrentLocation();
        setCurrentLocation(location);
      }
      
      return granted;
    } catch (error) {
      setError(error.message);
      return false;
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const location = await LocationService.getCurrentLocation();
      setCurrentLocation(location);
      setDefaultLocation(location);
      
      setIsLoading(false);
      return location;
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
      return null;
    }
  }, []);

  // Set default location
  const setDefaultLocation = useCallback(async (location) => {
    try {
      await LocationService.saveDefaultLocation(location);
      setDefaultLocation(location);
    } catch (error) {
      setError(error.message);
    }
  }, []);

  // Remove default location
  const removeDefaultLocation = useCallback(async () => {
    try {
      await LocationService.removeDefaultLocation();
      setDefaultLocation(DEFAULT_LOCATION);
    } catch (error) {
      setError(error.message);
    }
  }, []);

  // Reverse geocode coordinates
  const reverseGeocode = useCallback(async (latitude, longitude) => {
    try {
      return await LocationService.reverseGeocode(latitude, longitude);
    } catch (error) {
      setError(error.message);
      return null;
    }
  }, []);

  // Search locations
  const searchLocations = useCallback(async (query, limit = 10) => {
    try {
      return await LocationService.searchLocations(query, limit);
    } catch (error) {
      setError(error.message);
      return [];
    }
  }, []);

  // Get nearby locations
  const getNearbyLocations = useCallback(async (latitude, longitude, radius = 10, limit = 10) => {
    try {
      return await LocationService.getNearbyLocations(latitude, longitude, radius, limit);
    } catch (error) {
      setError(error.message);
      return [];
    }
  }, []);

  // Calculate distance between two coordinates
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    return LocationService.calculateDistance(lat1, lon1, lat2, lon2);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Open location settings
  const openLocationSettings = useCallback(async () => {
    try {
      await LocationService.openLocationSettings();
      const permission = await LocationService.checkPermissions();
      setHasPermission(permission);
    } catch (error) {
      setError(error.message);
    }
  }, []);

  // Start watching position
  const startWatchingPosition = useCallback((callback) => {
    return LocationService.watchPosition(callback);
  }, []);

  // Get effective location (current or default)
  const getEffectiveLocation = useCallback(() => {
    return currentLocation || defaultLocation;
  }, [currentLocation, defaultLocation]);

  const value = {
    currentLocation,
    defaultLocation,
    isLoading,
    error,
    hasPermission,
    isLocationEnabled,
    requestPermissions,
    getCurrentLocation,
    setDefaultLocation,
    removeDefaultLocation,
    reverseGeocode,
    searchLocations,
    getNearbyLocations,
    calculateDistance,
    clearError,
    openLocationSettings,
    startWatchingPosition,
    getEffectiveLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export { LocationContext, LocationProvider, useLocation };
