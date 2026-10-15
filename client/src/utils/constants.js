// App Configuration
const APP_CONFIG = {
  name: 'Adhan App',
  version: '1.0.0',
  description: 'Islamic Prayer Times Tracker',
};

// API Configuration
const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Aladhan API Configuration
const ALADHAN_API_CONFIG = {
  baseUrl: process.env.ALADHAN_API_BASE || 'https://api.aladhan.com/v1',
  defaultMethod: process.env.DEFAULT_PRAYER_METHOD || '2',
};

// Default Location
const DEFAULT_LOCATION = {
  latitude: parseFloat(process.env.DEFAULT_LATITUDE) || 21.4225,
  longitude: parseFloat(process.env.DEFAULT_LONGITUDE) || 39.8262,
  city: process.env.DEFAULT_CITY || 'Mecca',
  country: process.env.DEFAULT_COUNTRY || 'Saudi Arabia',
};

// Prayer Methods
const PRAYER_METHODS = {
  '2': 'Islamic Society of North America (ISNA)',
  '3': 'Islamic Society of North America (ISNA) - Modified',
  '4': 'Egyptian General Authority of Survey',
  '5': 'University of Islamic Sciences, Karachi',
  '7': 'Institute of Geophysics, University of Tehran',
  '8': 'Gulf Region',
  '9': 'Kuwait',
  '10': 'Qatar',
  '11': 'Majlis Ugama Islam Singapura, Singapore',
  '12': 'Union des Organisations Islamiques de France',
  '13': 'Diyanet İşleri Başkanlığı, Turkey',
  '14': 'Spiritual Administration of Muslims of Russia',
  '15': 'Moonsighting Committee Worldwide (also known as Moonsighting.com)',
  '16': 'Umm al-Qura, Makkah',
};

// Prayer Order
const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// Prayer Display Names
const PRAYER_DISPLAY_NAMES = {
  Fajr: 'Fajr',
  Sunrise: 'Sunrise',
  Dhuhr: 'Dhuhr',
  Asr: 'Asr',
  Maghrib: 'Maghrib',
  Isha: 'Isha',
};

// Arabic Prayer Names
const PRAYER_ARABIC_NAMES = {
  Fajr: 'الفجر',
  Sunrise: 'شروق',
  Dhuhr: ' الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

// Notification Settings
const NOTIFICATION_SETTINGS = {
  defaultBeforeMinutes: 10,
  maxBeforeMinutes: 60,
  minBeforeMinutes: 1,
};

// Theme Options
const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'Auto (System Default)' },
];

// Language Options
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
  { value: 'ur', label: 'اردو' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
];

// Storage Keys
const STORAGE_KEYS = {
  authToken: '@adhan_app_auth_token',
  user: '@adhan_app_user',
  theme: '@adhan_app_theme',
  language: '@adhan_app_language',
  prayerMethod: '@adhan_app_prayer_method',
  notificationSettings: '@adhan_app_notification_settings',
  defaultLocation: '@adhan_app_default_location',
  firstLaunch: '@adhan_app_first_launch',
};

// Countdown Thresholds (in minutes)
const COUNTDOWN_THRESHOLDS = {
  warning: 30,
  critical: 5,
};

// Animation Durations
const ANIMATION_DURATIONS = {
  fade: 300,
  slide: 400,
  scale: 200,
};

export {
  APP_CONFIG,
  API_CONFIG,
  ALADHAN_API_CONFIG,
  DEFAULT_LOCATION,
  PRAYER_METHODS,
  PRAYER_ORDER,
  PRAYER_DISPLAY_NAMES,
  PRAYER_ARABIC_NAMES,
  NOTIFICATION_SETTINGS,
  THEME_OPTIONS,
  LANGUAGE_OPTIONS,
  STORAGE_KEYS,
  COUNTDOWN_THRESHOLDS,
  ANIMATION_DURATIONS,
};
