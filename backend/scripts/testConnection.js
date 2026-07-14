require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

console.log('Testing model compilation...');
try {
  console.log('User Model compiled successfully');
  console.log('Doctor Model compiled successfully');
  console.log('Appointment Model compiled successfully');
} catch (e) {
  console.error('Model compilation failed:', e);
  process.exit(1);
}

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';
console.log(`Connecting to MongoDB at ${mongoUri}...`);

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB Connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });
