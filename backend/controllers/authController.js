const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecretjwtkey12345', {
    expiresIn: '30d',
  });
};

// @desc    Register a new Patient (User)
// @route   POST /api/auth/register/patient
// @access  Public
const registerPatient = async (req, res) => {
  const { name, email, password, city, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Patient with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      city,
      phone,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        phone: user.phone,
        role: 'patient',
        token: generateToken(user._id, 'patient'),
      });
    } else {
      res.status(400).json({ message: 'Invalid patient data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth Patient & get token
// @route   POST /api/auth/login/patient
// @access  Public
const loginPatient = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        phone: user.phone,
        role: 'patient',
        token: generateToken(user._id, 'patient'),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new Doctor
// @route   POST /api/auth/register/doctor
// @access  Public
const registerDoctor = async (req, res) => {
  const {
    name,
    email,
    password,
    specialty,
    clinicAddress,
    city,
    phone,
    experienceYears,
    availability,
  } = req.body;

  try {
    const doctorExists = await Doctor.findOne({ email });

    if (doctorExists) {
      return res.status(400).json({ message: 'Doctor with this email already exists' });
    }

    const doctor = await Doctor.create({
      name,
      email,
      password,
      specialty,
      clinicAddress,
      city,
      phone,
      experienceYears: Number(experienceYears),
      availability: availability || [], // Empty list initially if not provided
    });

    if (doctor) {
      res.status(201).json({
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        clinicAddress: doctor.clinicAddress,
        city: doctor.city,
        phone: doctor.phone,
        rating: doctor.rating,
        experienceYears: doctor.experienceYears,
        availability: doctor.availability,
        role: 'doctor',
        token: generateToken(doctor._id, 'doctor'),
      });
    } else {
      res.status(400).json({ message: 'Invalid doctor data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth Doctor & get token
// @route   POST /api/auth/login/doctor
// @access  Public
const loginDoctor = async (req, res) => {
  const { email, password } = req.body;

  try {
    const doctor = await Doctor.findOne({ email });

    if (doctor && (await doctor.comparePassword(password))) {
      res.json({
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        clinicAddress: doctor.clinicAddress,
        city: doctor.city,
        phone: doctor.phone,
        rating: doctor.rating,
        experienceYears: doctor.experienceYears,
        availability: doctor.availability,
        role: 'doctor',
        token: generateToken(doctor._id, 'doctor'),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.role,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerPatient,
  loginPatient,
  registerDoctor,
  loginDoctor,
  getProfile,
};
