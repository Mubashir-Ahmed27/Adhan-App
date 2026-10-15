import { useState, useEffect, useCallback } from 'react';
import { PrayerService } from '../services';
import { DEFAULT_LOCATION } from '../utils/constants';

const usePrayerTimes = (initialLocation = DEFAULT_LOCATION, initialMethod = '2') => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [todayPrayers, setTodayPrayers] = useState([]);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('00:00:00');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(initialLocation);
  const [method, setMethod] = useState(initialMethod);

  const fetchPrayerTimes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await PrayerService.getPrayerTimes(
        new Date().toISOString().split('T')[0],
        location.latitude,
        location.longitude,
        method
      );

      if (data) {
        setPrayerTimes(data);
        setTodayPrayers(PrayerService.getTodaysPrayers(data));
        setNextPrayer(data.nextPrayer);
        setCountdown(data.nextPrayer?.formattedTimeRemaining || '00:00:00');
      }

      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [location, method]);

  useEffect(() => {
    fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  // Countdown timer
  useEffect(() => {
    let timer;

    if (nextPrayer?.timeRemaining) {
      timer = setInterval(() => {
        const remaining = nextPrayer.timeRemaining - 1000;
        if (remaining <= 0) {
          fetchPrayerTimes();
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
  }, [nextPrayer, fetchPrayerTimes]);

  const changeLocation = useCallback(async (newLocation) => {
    setLocation(newLocation);
  }, []);

  const changeMethod = useCallback(async (newMethod) => {
    setMethod(newMethod);
  }, []);

  const refresh = useCallback(() => {
    fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  const getPrayerTime = useCallback((prayerName) => {
    if (!prayerTimes || !prayerTimes.timings) return '--:--';
    return prayerTimes.timings[prayerName] || '--:--';
  }, [prayerTimes]);

  const hasPrayerPassed = useCallback((prayerName) => {
    if (!prayerTimes) return false;
    return PrayerService.hasPrayerPassed(prayerName, prayerTimes);
  }, [prayerTimes]);

  const getCountdownObject = useCallback(() => {
    return PrayerService.getCountdown(nextPrayer);
  }, [nextPrayer]);

  return {
    prayerTimes,
    todayPrayers,
    nextPrayer,
    countdown,
    isLoading,
    error,
    location,
    method,
    fetchPrayerTimes,
    changeLocation,
    changeMethod,
    refresh,
    getPrayerTime,
    hasPrayerPassed,
    getCountdownObject,
  };
};

export default usePrayerTimes;
