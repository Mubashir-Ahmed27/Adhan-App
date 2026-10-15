const express = require('express');
const router = express.Router();

// Import all route files
const prayerRoutes = require('./prayerRoutes');
const userRoutes = require('./userRoutes');
const locationRoutes = require('./locationRoutes');

// Mount routes
router.use('/prayers', prayerRoutes);
router.use('/users', userRoutes);
router.use('/locations', locationRoutes);

module.exports = router;
