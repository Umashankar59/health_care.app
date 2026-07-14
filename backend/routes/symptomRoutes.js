const express = require('express');
const { analyzeSymptoms } = require('../controllers/symptomController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/analyze', protect, analyzeSymptoms);

module.exports = router;
