import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PrayerService } from '../services';
import { DEFAULT_LOCATION } from '../utils/constants';

const PrayerContext = createContext();

const PrayerProvider = ({ children }) => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [todayPrayers, setTodayPrayers] = useState([]);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('00:00:00');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [prayerMethod, setPrayerMethod] = useState('2');

  // Countdown timer effect
  useEffect(() => {
    let timer;
    
    if (nextPrayer && nextPrayer.timeRemaining) {
      timer = setInterval(() => {
        const remaining = nextPrayer.timeRemaining - 1000;
        if (remaining <= 0) {
          // Refresh prayer times
          fetchPrayerTimes(location.latitude, location.longitude, prayerMethod);
        } else {
          setNextPrayer(prev => ({
            ...prev,
            timeRemaining: remaining,
            formattedTimeRemaining: PrayerService.formatTimeRemaining(remaining),
          }));
          setCountdown(PrayerService.formatTimeRemaining(remaining));
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [nextPrayer, location, prayerMethod]);

  // Fetch prayer times
  const fetchPrayerTimes = useCallback(async (latitude, longitude, method = '2') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await PrayerService.getPrayerTimes(
        new Date().toISOString().split('T')[0],
        latitude,
        longitude,
        method
      );
      
      if (data) {
        setPrayerTimes(data);
        setTodayPrayers(PrayerService.getTodaysPrayers(data));
        setNextPrayer(data.nextPrayer);
        setCountdown(data.nextPrayer?.formattedTimeRemaining || '00:00:00');
        setLocation({
          latitude,
          longitude,
          city: data.city,
          country: data.country,
        });
        setPrayerMethod(method);
      }
      
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }, []);

  // Fetch today's prayer times
  const fetchTodayPrayerTimes = useCallback(async (latitude, longitude, method = '2') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await PrayerService.getTodayPrayerTimes(latitude, longitude, method);
      
      if (data) {
        setPrayerTimes(data);
        setTodayPrayers(PrayerService.getTodaysPrayers(data));
        setNextPrayer(data.nextPrayer);
        setCountdown(data.nextPrayer?.formattedTimeRemaining || '00:00:00');
        setLocation({
          latitude,
          longitude,
          city: data.city,
          country: data.country,
        });
        setPrayerMethod(method);
      }
      
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }, []);

  // Get next prayer
  const getNextPrayer = useCallback(async (latitude, longitude, method = '2') => {
    try {
      const data = await PrayerService.getNextPrayer(latitude, longitude, method);
      setNextPrayer(data);
      setCountdown(data?.formattedTimeRemaining || '00:00:00');
    } catch (error) {
      setError(error.message);
    }
  }, []);

  // Get countdown object
  const getCountdown = useCallback(() => {
    return PrayerService.getCountdown(nextPrayer);
  }, [nextPrayer]);

  // Check if a prayer has passed
  const hasPrayerPassed = useCallback((prayerName) => {
    if (!prayerTimes) return false;
    return PrayerService.hasPrayerPassed(prayerName, prayerTimes);
  }, [prayerTimes]);

  // Get prayer time by name
  const getPrayerTime = useCallback((prayerName) => {
    if (!prayerTimes || !prayerTimes.timings) return '--:--';
    return prayerTimes.timings[prayerName] || '--:--';
  }, [prayerTimes]);

  // Refresh prayer times
  const refreshPrayerTimes = useCallback(() => {
    if (location.latitude && location.longitude) {
      fetchPrayerTimes(location.latitude, location.longitude, prayerMethod);
    }
  }, [location, prayerMethod, fetchPrayerTimes]);

  // Change location
  const changeLocation = useCallback(async (newLocation, method = prayerMethod) => {
    setLocation(newLocation);
    await fetchPrayerTimes(newLocation.latitude, newLocation.longitude, method);
  }, [fetchPrayerTimes, prayerMethod]);

  // Change prayer method
  const changePrayerMethod = useCallback(async (method) => {
    setPrayerMethod(method);
    if (location.latitude && location.longitude) {
      await fetchPrayerTimes(location.latitude, location.longitude, method);
    }
  }, [location, fetchPrayerTimes]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    prayerTimes,
    todayPrayers,
    nextPrayer,
    countdown,
    isLoading,
    error,
    location,
    prayerMethod,
    fetchPrayerTimes,
    fetchTodayPrayerTimes,
    getNextPrayer,
    getCountdown,
    hasPrayerPassed,
    getPrayerTime,
    refreshPrayerTimes,
    changeLocation,
    changePrayerMethod,
    clearError,
  };

  return (
    <PrayerContext.Provider value={value}>
      {children}
    </PrayerContext.Provider>
  );
};

const usePrayer = () => {
  const context = useContext(PrayerContext);
  if (!context) {
    throw new Error('usePrayer must be used within a PrayerProvider');
  }
  return context;
};

export { PrayerContext, PrayerProvider, usePrayer };
