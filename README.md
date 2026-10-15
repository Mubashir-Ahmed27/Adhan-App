# Adhan App - Full Stack Islamic Prayer Times Tracker

## Overview

Adhan App is a comprehensive Islamic prayer times tracker built with **React Native (Expo)** for the mobile frontend, **Node.js/Express** for the backend API, and **MongoDB** for data storage. The app provides accurate prayer times based on user location, countdown timers, and various customization options.

## Features

### Core Features
- **Accurate Prayer Times**: Get precise prayer times for Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha
- **Location Detection**: Automatic location detection using GPS or manual location selection
- **Countdown Timer**: Real-time countdown to the next prayer with visual indicators
- **Multiple Calculation Methods**: Support for various prayer time calculation methods
- **Hijri Calendar**: Display of Islamic (Hijri) dates alongside Gregorian dates
- **Offline Support**: Caching of prayer times for offline use

### User Features
- **User Authentication**: Register, login, and manage profiles
- **Saved Locations**: Save and manage multiple locations
- **Custom Preferences**: Set default location, prayer method, and notification settings
- **Theme Support**: Light, dark, and auto (system) theme options
- **Language Support**: Multiple language options

### Premium Features (Future)
- **Push Notifications**: Get notified before each prayer time
- **Prayer History**: Track your prayer history and consistency
- **Qibla Direction**: Find the direction of the Kaaba
- **Dua Collection**: Access a collection of authentic duas
- **Quran Integration**: Read Quran with translations

## Tech Stack

### Frontend (Mobile)
- **React Native** with **Expo** for cross-platform mobile development
- **React Navigation** for navigation between screens
- **React Native Paper** for UI components
- **Expo Location** for GPS-based location detection
- **Expo Notifications** for push notifications
- **AsyncStorage** for local data persistence
- **Axios** for API requests
- **Date-fns** for date manipulation
- **Formik** and **Yup** for form validation

### Backend (API Server)
- **Node.js** with **Express** for the REST API
- **MongoDB** with **Mongoose** for data storage
- **JWT** for authentication
- **Bcrypt** for password hashing
- **CORS** for cross-origin requests
- **Helmet** for security headers
- **Morgan** for request logging
- **Express Rate Limit** for rate limiting
- **Axios** for external API requests

### External APIs
- **Aladhan API** for prayer times data
- **OpenStreetMap Nominatim API** for reverse geocoding

## Project Structure

```
adhan-app/
├── client/                          # React Native Frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── context/                # React Context providers
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── screens/                # App screens
│   │   ├── services/               # API services
│   │   ├── utils/                  # Utility functions and constants
│   │   └── assets/                # Static assets (images, fonts)
│   ├── App.jsx                    # Main app component
│   ├── package.json
│   ├── app.json
│   └── babel.config.js
│
└── server/                          # Node.js Backend
    ├── src/
    │   ├── models/                 # MongoDB models
    │   ├── controllers/             # Route controllers
    │   ├── routes/                 # API routes
    │   ├── middleware/              # Express middleware
    │   ├── config/                 # Configuration files
    │   └── utils/                  # Utility functions
    ├── index.js                   # Server entry point
    ├── package.json
    └── .env.example
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- MongoDB (local or Atlas)
- Expo CLI (for mobile development)
- Android Studio / Xcode (for emulators)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/adhan-app
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:19006,http://localhost:3000
ALADHAN_API_BASE=https://api.aladhan.com/v1
OPENSTREETMAP_API_BASE=https://nominatim.openstreetmap.org
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. Start the development server:
```bash
npm run dev
```

The server will start at `http://localhost:3000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file:
```env
API_BASE_URL=http://localhost:3000/api/v1
```

5. Start the Expo development server:
```bash
npx expo start
```

6. Run on your device:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Or scan the QR code with the Expo Go app on your physical device

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

#### POST /users/register
Register a new user

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "latitude": 21.4225,
  "longitude": 39.8262,
  "city": "Mecca",
  "country": "Saudi Arabia"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### POST /users/login
Login user

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Prayer Times

#### GET /prayers
Get prayer times for a specific date and location

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `latitude` (required): Latitude
- `longitude` (required): Longitude
- `method` (optional): Calculation method (default: 2)

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "city": "Mecca",
    "country": "Saudi Arabia",
    "method": "2",
    "timings": {
      "Fajr": "05:30",
      "Sunrise": "06:45",
      "Dhuhr": "12:15",
      "Asr": "15:30",
      "Maghrib": "18:00",
      "Isha": "19:30"
    },
    "nextPrayer": {
      "name": "Dhuhr",
      "time": "12:15",
      "timeRemaining": 12345678
    }
  }
}
```

#### GET /prayers/today
Get today's prayer times (requires authentication)

**Response:** Same as GET /prayers

#### GET /prayers/next
Get the next prayer time

**Query Parameters:**
- `latitude` (required): Latitude
- `longitude` (required): Longitude
- `method` (optional): Calculation method (default: 2)

**Response:**
```json
{
  "success": true,
  "data": {
    "nextPrayer": "Dhuhr",
    "time": "12:15",
    "timeRemaining": 12345678,
    "formattedTimeRemaining": "03:25:45",
    "city": "Mecca",
    "country": "Saudi Arabia",
    "date": "2024-01-15"
  }
}
```

#### GET /prayers/methods
Get all available prayer calculation methods

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "2", "name": "Islamic Society of North America (ISNA)" },
    { "id": "4", "name": "Egyptian General Authority of Survey" },
    ...
  ]
}
```

### Locations

#### GET /locations/reverse
Reverse geocode coordinates to address

**Query Parameters:**
- `latitude` (required): Latitude
- `longitude` (required): Longitude
- `zoom` (optional): Zoom level (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "formatted": "Mecca, Saudi Arabia",
    "city": "Mecca",
    "country": "Saudi Arabia",
    "latitude": 21.4225,
    "longitude": 39.8262
  }
}
```

#### GET /locations/search
Search for locations by name

**Query Parameters:**
- `query` (required): Search query
- `limit` (optional): Number of results (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "placeId": "123",
      "displayName": "Mecca, Saudi Arabia",
      "latitude": 21.4225,
      "longitude": 39.8262,
      "city": "Mecca",
      "country": "Saudi Arabia"
    },
    ...
  ]
}
```

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  location: {
    type: String (enum: ['Point']),
    coordinates: [Number, Number]
  },
  defaultCity: String,
  defaultCountry: String,
  prayerMethod: String (enum: prayer method IDs),
  notificationSettings: {
    fajr: Boolean,
    dhuhr: Boolean,
    asr: Boolean,
    maghrib: Boolean,
    isha: Boolean,
    beforeMinutes: Number
  },
  theme: String (enum: ['light', 'dark', 'auto']),
  language: String (enum: ['en', 'ar', 'ur', 'fr', 'es', 'de']),
  createdAt: Date,
  updatedAt: Date
}
```

### PrayerTime
```javascript
{
  user: ObjectId (ref: User),
  date: Date,
  location: {
    type: String (enum: ['Point']),
    coordinates: [Number, Number]
  },
  city: String,
  country: String,
  method: String,
  timings: {
    Fajr: String,
    Sunrise: String,
    Dhuhr: String,
    Asr: String,
    Maghrib: String,
    Isha: String,
    // Additional times
    Sunset: String,
    Imsak: String,
    Midnight: String
  },
  hijriDate: Object,
  gregorianDate: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Location
```javascript
{
  user: ObjectId (ref: User),
  name: String,
  city: String,
  country: String,
  coordinates: {
    type: String (enum: ['Point']),
    coordinates: [Number, Number]
  },
  timezone: String,
  isDefault: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

### Backend Deployment

#### Option 1: Render
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A strong secret key
   - `CORS_ORIGIN`: Your frontend URL
   - `NODE_ENV`: production
4. Deploy

#### Option 2: Railway
1. Create a new project on Railway
2. Import your GitHub repository
3. Set environment variables
4. Deploy

#### Option 3: Vercel
1. Create a new project on Vercel
2. Import your GitHub repository
3. Configure serverless functions
4. Set environment variables
5. Deploy

### Frontend Deployment

#### Expo EAS Build
1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure EAS:
```bash
eas build:configure
```

4. Build the app:
```bash
eas build --platform all
```

5. Submit to app stores:
```bash
eas submit --platform all
```

#### Alternative: Publish with Expo
```bash
npx expo publish
```

### Database Deployment

#### MongoDB Atlas
1. Create a free cluster on MongoDB Atlas
2. Whitelist your server IP address
3. Create a database user with read/write permissions
4. Get the connection string and add it to your environment variables

## Environment Variables

### Server (.env)
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/adhan-app?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://your-frontend-url.com
ALADHAN_API_BASE=https://api.aladhan.com/v1
OPENSTREETMAP_API_BASE=https://nominatim.openstreetmap.org
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Client (.env)
```env
API_BASE_URL=https://your-backend-url.com/api/v1
```

## Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

MIT License

## Contact

For questions or support, please open an issue on GitHub.

---

**Adhan App** - Your companion for accurate prayer times
