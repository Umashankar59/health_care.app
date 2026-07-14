const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @desc    Book a new appointment
// @route   POST /api/appointments/book
// @access  Private (Patient only)
const bookAppointment = async (req, res) => {
  const { doctorId, date, timeSlot } = req.body;
  const patientId = req.user._id;

  if (!doctorId || !date || !timeSlot) {
    return res.status(400).json({ message: 'Doctor ID, date, and time slot are required' });
  }

  try {
    // 1. Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // 2. Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // 3. Optional: Validate that the doctor works on this day of the week
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid date value' });
    }

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bookingDay = daysOfWeek[dateObj.getDay()];

    const dayAvailability = doctor.availability.find(
      avail => avail.day.toLowerCase() === bookingDay.toLowerCase()
    );

    if (!dayAvailability) {
      return res.status(400).json({ 
        message: `Doctor ${doctor.name} is not available on ${bookingDay}s.` 
      });
    }

    // 4. Concurrency check: Ensure no active (not cancelled) appointment exists for this doctor, date, and timeslot
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
      status: { $ne: 'Cancelled' } // If cancelled, the slot is free
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        message: 'This time slot is already booked. Please choose another slot or date.' 
      });
    }

    // 5. Save the appointment
    const appointment = new Appointment({
      patientId,
      doctorId,
      date,
      timeSlot,
      status: 'Pending' // Initial state is Pending, doctor can accept/cancel
    });

    const savedAppointment = await appointment.save();
    
    // Populate doctor info for the response
    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate('doctorId', 'name specialty clinicAddress phone')
      .populate('patientId', 'name email phone');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error('Booking Error:', error);
    
    // Catch MongoDB duplicate key error index: doctorId_1_date_1_timeSlot_1
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Concurrency conflict: This slot was just booked by another patient. Please try another slot.' 
      });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient appointments (Upcoming and Past)
// @route   GET /api/appointments/patient
// @access  Private (Patient only)
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialty clinicAddress city phone')
      .sort({ date: 1, timeSlot: 1 }); // Sorted by date ascending
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor schedule / appointments
// @route   GET /api/appointments/doctor
// @access  Private (Doctor only)
const getDoctorSchedule = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user._id })
      .populate('patientId', 'name email phone city')
      .sort({ date: 1, timeSlot: 1 });
      
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept or Cancel appointment (Doctor Action)
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor only)
const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;
  const appointmentId = req.params.id;

  if (!['Confirmed', 'Cancelled', 'Completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid appointment status' });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify this doctor owns the appointment
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this appointment' });
    }

    // Update status
    appointment.status = status;
    const updatedAppointment = await appointment.save();

    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialty');

    res.json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bookAppointment,
  getPatientAppointments,
  getDoctorSchedule,
  updateAppointmentStatus
};
