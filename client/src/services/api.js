import axios from 'axios';
import { API_CONFIG } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.authToken);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token (if refresh token endpoint exists)
        const token = await AsyncStorage.getItem(STORAGE_KEYS.authToken);
        if (token) {
          // For now, just clear and redirect to login
          await AsyncStorage.removeItem(STORAGE_KEYS.authToken);
          await AsyncStorage.removeItem(STORAGE_KEYS.user);
          // You would typically navigate to login here
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
      }
    }
    
    // Transform error response
    const errorResponse = {
      success: false,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    };
    
    return Promise.reject(errorResponse);
  }
);

// Authentication API
const authApi = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  updatePassword: (passwordData) => api.put('/users/password', passwordData),
  deleteAccount: (password) => api.delete(`/users/account?password=${password}`),
};

// Prayer Times API
const prayerApi = {
  getPrayerTimes: (params) => api.get('/prayers', { params }),
  getTodayPrayerTimes: () => api.get('/prayers/today'),
  getPrayerTimesRange: (params) => api.get('/prayers/range', { params }),
  getNextPrayer: (params) => api.get('/prayers/next', { params }),
  getPrayerMethods: () => api.get('/prayers/methods'),
};

// Location API
const locationApi = {
  reverseGeocode: (params) => api.get('/locations/reverse', { params }),
  searchLocations: (params) => api.get('/locations/search', { params }),
  getNearbyLocations: (params) => api.get('/locations/nearby', { params }),
  getCurrentLocation: () => api.get('/locations/current'),
  
  // User locations
  getUserLocations: () => api.get('/users/locations'),
  addLocation: (locationData) => api.post('/users/locations', locationData),
  deleteLocation: (locationId) => api.delete(`/users/locations/${locationId}`),
};

// Aladhan API (direct fallback)
const aladhanApi = axios.create({
  baseURL: 'https://api.aladhan.com/v1',
  timeout: 10000,
});

const aladhanService = {
  getPrayerTimes: (date, latitude, longitude, method = '2') => 
    aladhanApi.get('/timings/' + date, { params: { latitude, longitude, method } }),
  getCalendar: (month, year, latitude, longitude, method = '2') => 
    aladhanApi.get('/calendar', { params: { month, year, latitude, longitude, method } }),
  getMethods: () => aladhanApi.get('/methods'),
};

// OpenStreetMap API (direct fallback)
const osmApi = axios.create({
  baseURL: 'https://nominatim.openstreetmap.org',
  timeout: 10000,
  headers: {
    'User-Agent': 'Adhan-App/1.0',
  },
});

const osmService = {
  reverseGeocode: (latitude, longitude, zoom = 10) => 
    osmApi.get('/reverse', { params: { format: 'json', lat: latitude, lon: longitude, zoom, addressdetails: 1 } }),
  search: (query, limit = 10) => 
    osmApi.get('/search', { params: { q: query, format: 'json', limit, addressdetails: 1 } }),
};

export {
  api,
  authApi,
  prayerApi,
  locationApi,
  aladhanService,
  osmService,
};
