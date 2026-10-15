/**
 * Prayer Time Calculator Utility
 * Provides helper functions for prayer time calculations
 */

class PrayerTimeCalculator {
  // Prayer order for determining next prayer
  static PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  
  // Get next prayer from timings
  static getNextPrayer(timings, currentDate = new Date()) {
    const now = currentDate;
    let nextPrayer = null;
    let nextPrayerTime = null;
    let minDiff = Infinity;
    
    for (const prayer of this.PRAYER_ORDER) {
      if (!timings[prayer]) continue;
      
      const [hours, minutes, seconds] = timings[prayer].split(':');
      const prayerDate = new Date(now);
      prayerDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || 0));
      
      const diff = prayerDate - now;
      
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        nextPrayer = prayer;
        nextPrayerTime = prayerDate;
      }
    }
    
    // If no future prayer found today, return first prayer of next day
    if (!nextPrayer) {
      const nextDay = new Date(now);
      nextDay.setDate(nextDay.getDate() + 1);
      const firstPrayer = this.PRAYER_ORDER[0];
      const [hours, minutes, seconds] = timings[firstPrayer].split(':');
      const prayerDate = new Date(nextDay);
      prayerDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || 0));
      
      return {
        name: firstPrayer,
        time: timings[firstPrayer],
        timeRemaining: prayerDate - now,
        isNextDay: true
      };
    }
    
    return {
      name: nextPrayer,
      time: timings[nextPrayer],
      timeRemaining: nextPrayerTime - now,
      isNextDay: false
    };
  }
  
  // Format time string (HH:MM:SS to HH:MM)
  static formatTime(timeString) {
    if (!timeString) return '--:--';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  }
  
  // Convert time string to milliseconds since midnight
  static timeToMilliseconds(timeString) {
    if (!timeString) return 0;
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return (hours * 3600 + minutes * 60 + (seconds || 0)) * 1000;
  }
  
  // Get time remaining until next prayer in HH:MM:SS format
  static getTimeRemaining(nextPrayer) {
    if (!nextPrayer || !nextPrayer.timeRemaining) return '00:00:00';
    
    const totalSeconds = Math.floor(nextPrayer.timeRemaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  
  // Check if a prayer time has passed for today
  static hasPrayerPassed(prayerTime, currentDate = new Date()) {
    const [hours, minutes, seconds] = prayerTime.split(':').map(Number);
    const prayerDate = new Date(currentDate);
    prayerDate.setHours(hours, minutes, seconds || 0, 0);
    
    return prayerDate <= currentDate;
  }
  
  // Get all prayer times for today in chronological order
  static getTodaysPrayers(timings, currentDate = new Date()) {
    return this.PRAYER_ORDER.map(prayer => ({
      name: prayer,
      time: timings[prayer] || '--:--',
      hasPassed: this.hasPrayerPassed(timings[prayer] || '00:00:00', currentDate)
    }));
  }
  
  // Calculate time until next prayer in various formats
  static getCountdown(nextPrayer) {
    if (!nextPrayer || !nextPrayer.timeRemaining) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        formatted: '00:00:00'
      };
    }
    
    const totalSeconds = Math.floor(nextPrayer.timeRemaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return {
      hours,
      minutes,
      seconds,
      totalSeconds,
      formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    };
  }
}

module.exports = PrayerTimeCalculator;
