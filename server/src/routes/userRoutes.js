const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  updatePassword,
  deleteAccount,
  getUserLocations,
  addLocation,
  deleteLocation
} = require('../controllers/userController');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.delete('/account', protect, deleteAccount);

// Location routes
router.get('/locations', protect, getUserLocations);
router.post('/locations', protect, addLocation);
router.delete('/locations/:locationId', protect, deleteLocation);

module.exports = router;
