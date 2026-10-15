const Location = require('../models/Location');
const { osmClient } = require('../utils');
const { asyncHandler } = require('../middleware/errorHandler');

// Reverse geocode - get address from coordinates
const reverseGeocode = asyncHandler(async (req, res) => {
  const { latitude, longitude, zoom = 10 } = req.query;
  
  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required'
    });
  }
  
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates'
    });
  }
  
  try {
    // Use OpenStreetMap Nominatim API
    const response = await osmClient.get('/reverse', {
      format: 'json',
      lat,
      lon: lng,
      zoom: parseInt(zoom),
      addressdetails: 1
    });
    
    if (!response || !response.address) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    
    const address = response.address;
    
    res.status(200).json({
      success: true,
      data: {
        formatted: response.display_name,
        city: address.city || address.town || address.village || address.hamlet || '',
        country: address.country || '',
        state: address.state || '',
        road: address.road || '',
        suburb: address.suburb || '',
        postalCode: address.postcode || '',
        latitude: lat,
        longitude: lng,
        raw: address
      }
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to reverse geocode',
      error: error.message
    });
  }
});

// Search for locations by name
const searchLocations = asyncHandler(async (req, res) => {
  const { query, limit = 10 } = req.query;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Query parameter is required'
    });
  }
  
  try {
    // Use OpenStreetMap Nominatim API for search
    const response = await osmClient.get('/search', {
      q: query,
      format: 'json',
      limit: parseInt(limit),
      addressdetails: 1
    });
    
    if (!response || !Array.isArray(response)) {
      return res.status(404).json({
        success: false,
        message: 'No locations found'
      });
    }
    
    const results = response.map(item => ({
      placeId: item.place_id,
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      city: item.address.city || item.address.town || item.address.village || '',
      country: item.address.country || '',
      state: item.address.state || '',
      type: item.type
    }));
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error searching locations:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to search locations',
      error: error.message
    });
  }
});

// Get nearby locations (for discovery)
const getNearbyLocations = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 100, limit = 10 } = req.query;
  
  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required'
    });
  }
  
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const radiusKm = parseFloat(radius);
  const limitNum = parseInt(limit);
  
  if (isNaN(lat) || isNaN(lng) || isNaN(radiusKm) || isNaN(limitNum)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid parameters'
    });
  }
  
  try {
    // Convert radius from km to degrees (approximate)
    const radiusDegrees = radiusKm / 111.32;
    
    const locations = await Location.find({
      'coordinates.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radiusDegrees * 1000
        }
      }
    }).limit(limitNum);
    
    res.status(200).json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Error getting nearby locations:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get nearby locations',
      error: error.message
    });
  }
});

// Get user's current location based on IP (fallback method)
const getCurrentLocation = asyncHandler(async (req, res) => {
  try {
    // Get client IP address
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
    // Note: IP-based geolocation requires a third-party service
    // For now, return a message about this limitation
    res.status(200).json({
      success: true,
      message: 'IP-based geolocation requires a third-party service. Please use device GPS for accurate location.',
      ip
    });
  } catch (error) {
    console.error('Error getting current location:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get current location',
      error: error.message
    });
  }
});

module.exports = {
  reverseGeocode,
  searchLocations,
  getNearbyLocations,
  getCurrentLocation
};
