import { useState, useEffect, useCallback } from 'react';

const useCountdown = (initialTime = 0, isActive = true) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }, [isActive, timeRemaining]);

  useEffect(() => {
    let timer;

    if (isRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1000;
          return newTime > 0 ? newTime : 0;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeRemaining]);

  const start = useCallback((duration = initialTime) => {
    setTimeRemaining(duration);
    setIsRunning(true);
  }, [initialTime]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback((duration = initialTime) => {
    setTimeRemaining(duration);
    setIsRunning(false);
  }, [initialTime]);

  const restart = useCallback((duration = initialTime) => {
    setTimeRemaining(duration);
    setIsRunning(true);
  }, [initialTime]);

  const formatTime = useCallback((milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours,
      minutes,
      seconds,
      formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    };
  }, []);

  return {
    timeRemaining,
    isRunning,
    start,
    pause,
    resume,
    reset,
    restart,
    formatTime,
  };
};

export default useCountdown;
