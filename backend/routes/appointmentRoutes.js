const express = require('express');
const {
  bookAppointment,
  getPatientAppointments,
  getDoctorSchedule,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/book', protect, restrictTo('patient'), bookAppointment);
router.get('/patient', protect, restrictTo('patient'), getPatientAppointments);
router.get('/doctor', protect, restrictTo('doctor'), getDoctorSchedule);
router.put('/:id/status', protect, restrictTo('doctor'), updateAppointmentStatus);

module.exports = router;
