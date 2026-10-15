const prayerController = require('./prayerController');
const userController = require('./userController');
const locationController = require('./locationController');

module.exports = {
  ...prayerController,
  ...userController,
  ...locationController
};
