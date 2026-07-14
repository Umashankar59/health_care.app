const Doctor = require('../models/Doctor');

// @desc    Search doctors by city and specialty with sorting
// @route   GET /api/doctors/search
// @access  Private
const searchDoctors = async (req, res) => {
  const { city, specialty, sortBy } = req.query;

  try {
    const query = {};

    if (city) {
      // Case-insensitive exact or regex search for city
      query.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
    }

    if (specialty) {
      // Case-insensitive exact or regex search for specialty
      query.specialty = { $regex: new RegExp(`^${specialty.trim()}$`, 'i') };
    }

    let sortOption = {};
    if (sortBy === 'rating') {
      sortOption = { rating: -1, experienceYears: -1 };
    } else if (sortBy === 'experienceYears') {
      sortOption = { experienceYears: -1, rating: -1 };
    } else {
      // Default: sort by rating then experience years
      sortOption = { rating: -1, experienceYears: -1 };
    }

    const doctors = await Doctor.find(query)
      .select('-password')
      .sort(sortOption);

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Private
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update doctor availability
// @route   PUT /api/doctors/availability
// @access  Private/Doctor
const updateAvailability = async (req, res) => {
  const { availability } = req.body;

  try {
    // req.user is populated by protect middleware
    const doctor = await Doctor.findById(req.user._id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.availability = availability || [];
    const updatedDoctor = await doctor.save();

    res.json({
      _id: updatedDoctor._id,
      name: updatedDoctor.name,
      email: updatedDoctor.email,
      specialty: updatedDoctor.specialty,
      availability: updatedDoctor.availability,
      message: 'Availability updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all unique specialties and cities available in the database (useful for frontend dropdowns)
// @route   GET /api/doctors/meta
// @access  Private
const getDoctorMeta = async (req, res) => {
  try {
    const specialties = await Doctor.distinct('specialty');
    const cities = await Doctor.distinct('city');
    res.json({ specialties, cities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchDoctors,
  getDoctorById,
  updateAvailability,
  getDoctorMeta,
};
