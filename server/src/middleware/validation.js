const { validationResult } = require('express-validator');

// Validate request using express-validator
const validateRequest = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg
        }))
      });
    }
    
    next();
  };
};

// Custom validation functions
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(String(id));
};

const isValidEmail = (email) => {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

const isValidPassword = (password) => {
  return password && password.length >= 6;
};

const isValidCoordinates = (lat, lng) => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const isValidTimeString = (time) => {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(time);
};

module.exports = {
  validateRequest,
  isValidObjectId,
  isValidEmail,
  isValidPassword,
  isValidCoordinates,
  isValidTimeString
};
