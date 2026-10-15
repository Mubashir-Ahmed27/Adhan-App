const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPrayerTimes,
  getTodayPrayerTimes,
  getPrayerTimesRange,
  getNextPrayer,
  getPrayerMethods
} = require('../controllers/prayerController');

// Public routes
router.get('/', getPrayerTimes);
router.get('/next', getNextPrayer);
router.get('/methods', getPrayerMethods);

// Protected routes (require authentication)
router.get('/today', protect, getTodayPrayerTimes);
router.get('/range', protect, getPrayerTimesRange);

module.exports = router;
