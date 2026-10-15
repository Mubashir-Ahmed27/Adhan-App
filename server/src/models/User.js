const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  defaultCity: {
    type: String,
    default: ''
  },
  defaultCountry: {
    type: String,
    default: ''
  },
  prayerMethod: {
    type: String,
    enum: ['2', '3', '4', '5', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
    default: '2'
  },
  notificationSettings: {
    fajr: { type: Boolean, default: true },
    dhuhr: { type: Boolean, default: true },
    asr: { type: Boolean, default: true },
    maghrib: { type: Boolean, default: true },
    isha: { type: Boolean, default: true },
    beforeMinutes: { type: Number, default: 10 }
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'auto'
  },
  language: {
    type: String,
    enum: ['en', 'ar', 'ur', 'fr', 'es', 'de'],
    default: 'en'
  },
  isActive: {
    type: Boolean,
    default: true
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
userSchema.index({ email: 1 });
userSchema.index({ location: '2dsphere' });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for user's role (for future extensibility)
userSchema.virtual('role').get(function() {
  return 'user';
});

const User = mongoose.model('User', userSchema);

module.exports = User;
