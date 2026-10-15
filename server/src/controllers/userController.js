const User = require('../models/User');
const Location = require('../models/Location');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { isValidEmail, isValidPassword } = require('../middleware/validation');

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, latitude, longitude, city, country } = req.body;
  
  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    });
  }
  
  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }
  
  // Validate password strength
  if (!isValidPassword(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }
  
  try {
    // Create new user
    const user = new User({
      name,
      email,
      password
    });
    
    // If location provided, set it
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        user.location = {
          type: 'Point',
          coordinates: [lng, lat]
        };
        user.defaultCity = city || '';
        user.defaultCountry = country || '';
      }
    }
    
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    // Save default location if coordinates were provided
    if (user.location.coordinates.length === 2) {
      const location = new Location({
        user: user._id,
        name: 'Default Location',
        city: city || 'Unknown',
        country: country || 'Unknown',
        coordinates: {
          type: 'Point',
          coordinates: user.location.coordinates
        },
        isDefault: true
      });
      
      await location.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          defaultCity: user.defaultCity,
          defaultCountry: user.defaultCountry,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  try {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          defaultCity: user.defaultCity,
          defaultCountry: user.defaultCountry,
          prayerMethod: user.prayerMethod,
          notificationSettings: user.notificationSettings,
          theme: user.theme,
          language: user.language
        },
        token
      }
    });
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message
    });
  }
});

// Get user profile
const getProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user's locations
    const locations = await Location.find({ user: user._id });
    
    res.status(200).json({
      success: true,
      data: {
        user,
        locations
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, defaultCity, defaultCountry, prayerMethod, notificationSettings, theme, language } = req.body;
  
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields
    if (name) user.name = name;
    if (defaultCity) user.defaultCity = defaultCity;
    if (defaultCountry) user.defaultCountry = defaultCountry;
    if (prayerMethod) user.prayerMethod = prayerMethod;
    if (notificationSettings) user.notificationSettings = notificationSettings;
    if (theme) user.theme = theme;
    if (language) user.language = language;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Update password
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    });
  }
  
  if (!isValidPassword(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters'
    });
  }
  
  try {
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message
    });
  }
});

// Delete user account
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.query;
  
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required for account deletion'
    });
  }
  
  try {
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect'
      });
    }
    
    // Delete user and all related data
    await Promise.all([
      User.findByIdAndDelete(user._id),
      Location.deleteMany({ user: user._id }),
      require('../models/PrayerTime').deleteMany({ user: user._id })
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
});

// Get user's saved locations
const getUserLocations = asyncHandler(async (req, res) => {
  try {
    const locations = await Location.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching user locations:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch locations',
      error: error.message
    });
  }
});

// Add a new location for user
const addLocation = asyncHandler(async (req, res) => {
  const { name, city, country, latitude, longitude, timezone, isDefault } = req.body;
  
  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required'
    });
  }
  
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates'
    });
  }
  
  try {
    const location = new Location({
      user: req.user._id,
      name: name || 'New Location',
      city: city || 'Unknown',
      country: country || 'Unknown',
      coordinates: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      timezone: timezone || null,
      isDefault: isDefault || false
    });
    
    await location.save();
    
    res.status(201).json({
      success: true,
      message: 'Location added successfully',
      data: location
    });
  } catch (error) {
    console.error('Error adding location:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add location',
      error: error.message
    });
  }
});

// Delete a location
const deleteLocation = asyncHandler(async (req, res) => {
  const { locationId } = req.params;
  
  try {
    const location = await Location.findOneAndDelete({
      _id: locationId,
      user: req.user._id
    });
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found or not authorized'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting location:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete location',
      error: error.message
    });
  }
});

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  updatePassword,
  deleteAccount,
  getUserLocations,
  addLocation,
  deleteLocation
};
