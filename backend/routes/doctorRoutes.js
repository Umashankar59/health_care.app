const express = require('express');
const {
  searchDoctors,
  getDoctorById,
  updateAvailability,
  getDoctorMeta,
} = require('../controllers/doctorController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', protect, searchDoctors);
router.get('/meta', protect, getDoctorMeta);
router.put('/availability', protect, restrictTo('doctor'), updateAvailability);
router.get('/:id', protect, getDoctorById);

module.exports = router;
