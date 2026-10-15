const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  reverseGeocode,
  searchLocations,
  getNearbyLocations,
  getCurrentLocation
} = require('../controllers/locationController');

// Public routes
router.get('/reverse', reverseGeocode);
router.get('/search', searchLocations);
router.get('/nearby', getNearbyLocations);
router.get('/current', getCurrentLocation);

module.exports = router;
