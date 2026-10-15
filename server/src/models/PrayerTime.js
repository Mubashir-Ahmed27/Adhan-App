const mongoose = require('mongoose');

const prayerTimeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  method: {
    type: String,
    enum: ['2', '3', '4', '5', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
    default: '2'
  },
  timings: {
    Fajr: { type: String, required: true },
    Sunrise: { type: String, required: true },
    Dhuhr: { type: String, required: true },
    Asr: { type: String, required: true },
    Sunset: { type: String, required: false },
    Maghrib: { type: String, required: true },
    Isha: { type: String, required: true },
    Imsak: { type: String, required: false },
    Midnight: { type: String, required: false },
    Firstthird: { type: String, required: false },
    Lastthird: { type: String, required: false }
  },
  hijriDate: {
    date: { type: String, required: false },
    format: { type: String, required: false },
    day: { type: String, required: false },
    weekday: {
      en: { type: String, required: false },
      ar: { type: String, required: false }
    },
    month: {
      en: { type: String, required: false },
      ar: { type: String, required: false },
      number: { type: Number, required: false }
    },
    year: { type: String, required: false },
    designation: {
      abbreviated: { type: String, required: false },
      expanded: { type: String, required: false }
    }
  },
  gregorianDate: {
    date: { type: String, required: false },
    format: { type: String, required: false },
    day: { type: String, required: false },
    weekday: {
      en: { type: String, required: false },
      ar: { type: String, required: false }
    },
    month: {
      en: { type: String, required: false },
      ar: { type: String, required: false },
      number: { type: Number, required: false }
    },
    year: { type: String, required: false },
    designation: {
      abbreviated: { type: String, required: false },
      expanded: { type: String, required: false }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
prayerTimeSchema.index({ user: 1, date: 1 }, { unique: true });
prayerTimeSchema.index({ date: 1 });
prayerTimeSchema.index({ location: '2dsphere' });
prayerTimeSchema.index({ city: 1, country: 1 });

// Static method to get prayer times for a specific date and location
prayerTimeSchema.statics.getPrayerTimes = async function(date, latitude, longitude, method = '2') {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.findOne({
    date: { $gte: startOfDay, $lte: endOfDay },
    'location.coordinates': [longitude, latitude],
    method
  }).sort({ createdAt: -1 });
};

// Virtual for next prayer
prayerTimeSchema.virtual('nextPrayer').get(function() {
  const now = new Date();
  const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  
  for (const prayer of prayerOrder) {
    if (!this.timings[prayer]) continue;
    
    const [hours, minutes] = this.timings[prayer].split(':');
    const prayerDate = new Date(this.date);
    prayerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (prayerDate > now) {
      return {
        name: prayer,
        time: this.timings[prayer],
        timeRemaining: prayerDate - now
      };
    }
  }
  
  return null;
});

const PrayerTime = mongoose.model('PrayerTime', prayerTimeSchema);

module.exports = PrayerTime;
