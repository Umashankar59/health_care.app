const express = require('express');
const {
  registerPatient,
  loginPatient,
  registerDoctor,
  loginDoctor,
  getProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register/patient', registerPatient);
router.post('/login/patient', loginPatient);
router.post('/register/doctor', registerDoctor);
router.post('/login/doctor', loginDoctor);
router.get('/profile', protect, getProfile);

module.exports = router;
