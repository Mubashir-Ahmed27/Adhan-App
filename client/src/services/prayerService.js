import { prayerApi, aladhanService } from './api';
import { PRAYER_ORDER, PRAYER_DISPLAY_NAMES, PRAYER_ARABIC_NAMES } from '../utils/constants';
import { format, parseISO, isSameDay, isAfter, isBefore, addDays } from 'date-fns';

class PrayerService {
  // Get prayer times for a specific date and location
  static async getPrayerTimes(date, latitude, longitude, method = '2') {
    try {
      const response = await prayerApi.getPrayerTimes({
        date,
        latitude,
        longitude,
        method,
      });
      
      if (response.data.success) {
        return this.normalizePrayerTimes(response.data.data);
      }
      
      // Fallback to direct Aladhan API
      const fallbackResponse = await aladhanService.getPrayerTimes(date, latitude, longitude, method);
      return this.normalizePrayerTimes(fallbackResponse.data.data);
    } catch (error) {
      console.error('Error getting prayer times:', error);
      throw error;
    }
  }

  // Get today's prayer times
  static async getTodayPrayerTimes(latitude, longitude, method = '2') {
    try {
      const today = new Date();
      const dateStr = format(today, 'yyyy-MM-dd');
      
      const response = await this.getPrayerTimes(dateStr, latitude, longitude, method);
      return response;
    } catch (error) {
      console.error('Error getting today prayer times:', error);
      throw error;
    }
  }

  // Get next prayer information
  static async getNextPrayer(latitude, longitude, method = '2') {
    try {
      const response = await prayerApi.getNextPrayer({
        latitude,
        longitude,
        method,
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      
      // Fallback: get today's times and calculate
      const todayTimes = await this.getTodayPrayerTimes(latitude, longitude, method);
      return this.calculateNextPrayer(todayTimes);
    } catch (error) {
      console.error('Error getting next prayer:', error);
      throw error;
    }
  }

  // Get prayer times for a range of dates
  static async getPrayerTimesRange(startDate, endDate, latitude, longitude, method = '2') {
    try {
      const response = await prayerApi.getPrayerTimesRange({
        startDate,
        endDate,
        latitude,
        longitude,
        method,
      });
      
      if (response.data.success) {
        return response.data.data.map(day => this.normalizePrayerTimes(day));
      }
      
      // Fallback: fetch each day individually
      const dates = this.getDateRange(startDate, endDate);
      const results = [];
      
      for (const date of dates) {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayTimes = await this.getPrayerTimes(dateStr, latitude, longitude, method);
        results.push(dayTimes);
      }
      
      return results;
    } catch (error) {
      console.error('Error getting prayer times range:', error);
      throw error;
    }
  }

  // Get prayer methods
  static async getPrayerMethods() {
    try {
      const response = await prayerApi.getPrayerMethods();
      if (response.data.success) {
        return response.data.data;
      }
      
      const fallbackResponse = await aladhanService.getMethods();
      return fallbackResponse.data;
    } catch (error) {
      console.error('Error getting prayer methods:', error);
      throw error;
    }
  }

  // Normalize prayer times data
  static normalizePrayerTimes(data) {
    if (!data) return null;
    
    // Extract timings
    const timings = data.timings || {};
    
    // Format all times
    const formattedTimings = {};
    for (const [key, value] of Object.entries(timings)) {
      formattedTimings[key] = this.formatTime(value);
    }
    
    // Get date information
    const date = data.date ? parseISO(data.date) : new Date();
    
    return {
      id: data._id || Date.now().toString(),
      date: date.toISOString().split('T')[0],
      formattedDate: format(date, 'EEEE, MMMM do, yyyy'),
      hijriDate: data.hijriDate || null,
      gregorianDate: data.gregorianDate || null,
      location: data.location || null,
      city: data.city || '',
      country: data.country || '',
      method: data.method || '2',
      timings: formattedTimings,
      nextPrayer: this.calculateNextPrayer({ timings: formattedTimings, date: date.toISOString() }),
    };
  }

  // Calculate next prayer from timings
  static calculateNextPrayer(prayerData) {
    if (!prayerData || !prayerData.timings) {
      return null;
    }
    
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateStr = prayerData.date || format(today, 'yyyy-MM-dd');
    const prayerDate = parseISO(dateStr);
    
    let nextPrayer = null;
    let nextPrayerTime = null;
    let minDiff = Infinity;
    let isNextDay = false;
    
    for (const prayer of PRAYER_ORDER) {
      if (!prayerData.timings[prayer]) continue;
      
      const timeStr = prayerData.timings[prayer];
      const [hours, minutes] = timeStr.split(':').map(Number);
      const prayerDateTime = new Date(prayerDate);
      prayerDateTime.setHours(hours, minutes, 0, 0);
      
      const diff = prayerDateTime - now;
      
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        nextPrayer = prayer;
        nextPrayerTime = prayerDateTime;
        isNextDay = false;
      }
    }
    
    // If no future prayer found today, get first prayer of next day
    if (!nextPrayer) {
      const nextDay = addDays(prayerDate, 1);
      const firstPrayer = PRAYER_ORDER[0];
      const timeStr = prayerData.timings[firstPrayer];
      const [hours, minutes] = timeStr.split(':').map(Number);
      const prayerDateTime = new Date(nextDay);
      prayerDateTime.setHours(hours, minutes, 0, 0);
      
      nextPrayer = firstPrayer;
      nextPrayerTime = prayerDateTime;
      isNextDay = true;
    }
    
    if (!nextPrayer) return null;
    
    const timeRemaining = nextPrayerTime - now;
    
    return {
      name: nextPrayer,
      displayName: PRAYER_DISPLAY_NAMES[nextPrayer] || nextPrayer,
      arabicName: PRAYER_ARABIC_NAMES[nextPrayer] || nextPrayer,
      time: prayerData.timings[nextPrayer],
      timeRemaining,
      formattedTimeRemaining: this.formatTimeRemaining(timeRemaining),
      isNextDay,
    };
  }

  // Format time string (HH:MM:SS to HH:MM)
  static formatTime(timeString) {
    if (!timeString || timeString === '--:--') return '--:--';
    
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  }

  // Format time remaining in HH:MM:SS
  static formatTimeRemaining(milliseconds) {
    if (milliseconds <= 0) return '00:00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // Get date range between two dates
  static getDateRange(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    
    while (currentDate <= lastDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  // Get all prayers for today with their status
  static getTodaysPrayers(prayerData) {
    if (!prayerData || !prayerData.timings) return [];
    
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateStr = prayerData.date || format(today, 'yyyy-MM-dd');
    const prayerDate = parseISO(dateStr);
    
    return PRAYER_ORDER.map(prayer => {
      const timeStr = prayerData.timings[prayer] || '--:--';
      const [hours, minutes] = timeStr.split(':').map(Number);
      const prayerDateTime = new Date(prayerDate);
      prayerDateTime.setHours(hours, minutes, 0, 0);
      
      const hasPassed = isBefore(prayerDateTime, now);
      const isNext = !hasPassed && isAfter(prayerDateTime, now);
      
      return {
        name: prayer,
        displayName: PRAYER_DISPLAY_NAMES[prayer] || prayer,
        arabicName: PRAYER_ARABIC_NAMES[prayer] || prayer,
        time: timeStr,
        hasPassed,
        isNext,
        timeUntil: hasPassed ? null : this.formatTimeRemaining(prayerDateTime - now),
      };
    });
  }

  // Check if a specific prayer has passed today
  static hasPrayerPassed(prayer, prayerData) {
    if (!prayerData || !prayerData.timings || !prayerData.timings[prayer]) {
      return false;
    }
    
    const now = new Date();
    const dateStr = prayerData.date || format(now, 'yyyy-MM-dd');
    const prayerDate = parseISO(dateStr);
    
    const timeStr = prayerData.timings[prayer];
    const [hours, minutes] = timeStr.split(':').map(Number);
    const prayerDateTime = new Date(prayerDate);
    prayerDateTime.setHours(hours, minutes, 0, 0);
    
    return isBefore(prayerDateTime, now);
  }

  // Get time until next prayer in various formats
  static getCountdown(nextPrayer) {
    if (!nextPrayer || !nextPrayer.timeRemaining) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        formatted: '00:00:00',
        isCritical: false,
        isWarning: false,
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
      formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      isCritical: hours === 0 && minutes <= 5,
      isWarning: hours === 0 && minutes <= 30,
    };
  }
}

export default PrayerService;
