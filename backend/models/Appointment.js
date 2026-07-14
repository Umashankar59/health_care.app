const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: String, // e.g., '2026-07-15' (YYYY-MM-DD)
    required: true
  },
  timeSlot: {
    type: String, // e.g., '09:30' (HH:MM)
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending',
    required: true
  }
}, {
  timestamps: true
});

// Unique compound index to enforce slot uniqueness at database level
appointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
