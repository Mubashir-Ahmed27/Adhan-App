const PrayerTime = require('../models/PrayerTime');
const Location = require('../models/Location');
const { aladhanClient } = require('../utils');
const { asyncHandler } = require('../middleware/errorHandler');

// Get prayer times for a specific date and location
const getPrayerTimes = asyncHandler(async (req, res) => {
  const { date, latitude, longitude, method } = req.query;
  
  if (!date || !latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Date, latitude, and longitude are required'
    });
  }
  
  // Parse date
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format. Use YYYY-MM-DD or ISO format'
    });
  }
  
  // Parse coordinates
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates'
    });
  }
  
  // Format date for API (YYYY-MM-DD)
  const dateStr = parsedDate.toISOString().split('T')[0];
  const calculationMethod = method || '2';
  
  try {
    // Try to get cached prayer times from database
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const cachedPrayerTimes = await PrayerTime.findOne({
      date: { $gte: startOfDay, $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1) },
      'location.coordinates': [lng, lat],
      method: calculationMethod
    });
    
    if (cachedPrayerTimes) {
      return res.status(200).json({
        success: true,
        data: cachedPrayerTimes,
        cached: true
      });
    }
    
    // Fetch from Aladhan API
    const response = await aladhanClient.get('/timings/' + dateStr, {
      latitude: lat,
      longitude: lng,
      method: calculationMethod
    });
    
    if (!response || !response.data) {
      return res.status(404).json({
        success: false,
        message: 'Prayer times not found for the specified location and date'
      });
    }
    
    const prayerData = response.data;
    
    // Extract city and country from response
    const city = prayerData.meta.method.name || 'Unknown';
    const country = prayerData.meta.method.params.School || 'Unknown';
    
    // Save to database for caching
    const prayerTime = new PrayerTime({
      user: req.user?._id,
      date: parsedDate,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      city,
      country,
      method: calculationMethod,
      timings: prayerData.timings,
      hijriDate: prayerData.date.hijri,
      gregorianDate: prayerData.date.gregorian
    });
    
    await prayerTime.save();
    
    res.status(200).json({
      success: true,
      data: prayerTime,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching prayer times:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prayer times',
      error: error.message
    });
  }
});

// Get prayer times for today based on user's location
const getTodayPrayerTimes = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Get user's default location
  const defaultLocation = await Location.findOne({
    user: req.user._id,
    isDefault: true
  });
  
  if (!defaultLocation) {
    return res.status(400).json({
      success: false,
      message: 'No default location set. Please set a default location first.'
    });
  }
  
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const method = req.user.prayerMethod || '2';
  
  try {
    // Check for cached prayer times
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const cachedPrayerTimes = await PrayerTime.findOne({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1) },
      method
    });
    
    if (cachedPrayerTimes) {
      return res.status(200).json({
        success: true,
        data: cachedPrayerTimes,
        cached: true
      });
    }
    
    // Fetch from Aladhan API
    const [lng, lat] = defaultLocation.coordinates.coordinates;
    
    const response = await aladhanClient.get('/timings/' + dateStr, {
      latitude: lat,
      longitude: lng,
      method
    });
    
    if (!response || !response.data) {
      return res.status(404).json({
        success: false,
        message: 'Prayer times not found'
      });
    }
    
    const prayerData = response.data;
    
    // Save to database
    const prayerTime = new PrayerTime({
      user: req.user._id,
      date: today,
      location: defaultLocation.location,
      city: defaultLocation.city,
      country: defaultLocation.country,
      method,
      timings: prayerData.timings,
      hijriDate: prayerData.date.hijri,
      gregorianDate: prayerData.date.gregorian
    });
    
    await prayerTime.save();
    
    res.status(200).json({
      success: true,
      data: prayerTime,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching today prayer times:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prayer times',
      error: error.message
    });
  }
});

// Get prayer times for a range of dates
const getPrayerTimesRange = asyncHandler(async (req, res) => {
  const { startDate, endDate, latitude, longitude, method } = req.query;
  
  if (!startDate || !endDate || !latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'startDate, endDate, latitude, and longitude are required'
    });
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const calculationMethod = method || '2';
  
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid parameters'
    });
  }
  
  if (start > end) {
    return res.status(400).json({
      success: false,
      message: 'startDate must be before endDate'
    });
  }
  
  // Calculate number of days
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  if (days > 30) {
    return res.status(400).json({
      success: false,
      message: 'Maximum range is 30 days'
    });
  }
  
  try {
    const results = [];
    
    // Check for cached data
    const startOfStartDay = new Date(start);
    startOfStartDay.setHours(0, 0, 0, 0);
    
    const endOfEndDay = new Date(end);
    endOfEndDay.setHours(23, 59, 59, 999);
    
    const cachedTimes = await PrayerTime.find({
      date: { $gte: startOfStartDay, $lte: endOfEndDay },
      'location.coordinates': [lng, lat],
      method: calculationMethod
    }).sort({ date: 1 });
    
    if (cachedTimes.length === days) {
      return res.status(200).json({
        success: true,
        data: cachedTimes,
        cached: true
      });
    }
    
    // Fetch from API for missing dates
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Check if we already have this date
      const existing = cachedTimes.find(pt => 
        pt.date.toISOString().split('T')[0] === dateStr
      );
      
      if (existing) {
        results.push(existing);
      } else {
        // Fetch from API
        const response = await aladhanClient.get('/timings/' + dateStr, {
          latitude: lat,
          longitude: lng,
          method: calculationMethod
        });
        
        if (response && response.data) {
          const prayerData = response.data;
          const prayerTime = new PrayerTime({
            user: req.user?._id,
            date: new Date(currentDate),
            location: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            city: prayerData.meta.method.name || 'Unknown',
            country: prayerData.meta.method.params.School || 'Unknown',
            method: calculationMethod,
            timings: prayerData.timings,
            hijriDate: prayerData.date.hijri,
            gregorianDate: prayerData.date.gregorian
          });
          
          await prayerTime.save();
          results.push(prayerTime);
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    res.status(200).json({
      success: true,
      data: results,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching prayer times range:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prayer times range',
      error: error.message
    });
  }
});

// Get next prayer time
const getNextPrayer = asyncHandler(async (req, res) => {
  const { latitude, longitude, method } = req.query;
  
  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'latitude and longitude are required'
    });
  }
  
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const calculationMethod = method || '2';
  
  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates'
    });
  }
  
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    // Try to get from cache
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const cachedPrayerTimes = await PrayerTime.findOne({
      date: { $gte: startOfDay, $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1) },
      'location.coordinates': [lng, lat],
      method: calculationMethod
    });
    
    let timings;
    let city = 'Unknown';
    let country = 'Unknown';
    
    if (cachedPrayerTimes) {
      timings = cachedPrayerTimes.timings;
      city = cachedPrayerTimes.city;
      country = cachedPrayerTimes.country;
    } else {
      // Fetch from API
      const response = await aladhanClient.get('/timings/' + dateStr, {
        latitude: lat,
        longitude: lng,
        method: calculationMethod
      });
      
      if (!response || !response.data) {
        return res.status(404).json({
          success: false,
          message: 'Prayer times not found'
        });
      }
      
      timings = response.data.timings;
      city = response.data.meta.method.name || 'Unknown';
      country = response.data.meta.method.params.School || 'Unknown';
      
      // Cache the data
      const prayerTime = new PrayerTime({
        date: today,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        city,
        country,
        method: calculationMethod,
        timings,
        hijriDate: response.data.date.hijri,
        gregorianDate: response.data.date.gregorian
      });
      
      await prayerTime.save();
    }
    
    // Calculate next prayer
    const { PrayerTimeCalculator } = require('../utils');
    const nextPrayer = PrayerTimeCalculator.getNextPrayer(timings, today);
    
    res.status(200).json({
      success: true,
      data: {
        nextPrayer: nextPrayer.name,
        time: nextPrayer.time,
        timeRemaining: nextPrayer.timeRemaining,
        formattedTimeRemaining: PrayerTimeCalculator.getTimeRemaining(nextPrayer),
        city,
        country,
        date: dateStr
      }
    });
  } catch (error) {
    console.error('Error getting next prayer:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get next prayer',
      error: error.message
    });
  }
});

// Get all prayer methods
const getPrayerMethods = asyncHandler(async (req, res) => {
  try {
    const response = await aladhanClient.get('/methods');
    
    if (!response || !response.data) {
      return res.status(404).json({
        success: false,
        message: 'Prayer methods not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error fetching prayer methods:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prayer methods',
      error: error.message
    });
  }
});

module.exports = {
  getPrayerTimes,
  getTodayPrayerTimes,
  getPrayerTimesRange,
  getNextPrayer,
  getPrayerMethods
};
