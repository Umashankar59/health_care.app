const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: {
    type: String, // e.g. "09:00"
    required: true
  },
  endTime: {
    type: String, // e.g. "17:00"
    required: true
  },
  slotDuration: {
    type: Number, // e.g. 30 (minutes)
    required: true,
    default: 30
  }
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  specialty: {
    type: String,
    required: true,
    trim: true,
  },
  clinicAddress: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  experienceYears: {
    type: Number,
    required: true,
    min: 0,
  },
  availability: [availabilitySchema]
}, {
  timestamps: true
});

// Hash password before saving
doctorSchema.pre('save', async function (next) {
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

// Compare password method
doctorSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Doctor', doctorSchema);
