const express = require('express');
const router = express.Router();
const { predictDisease, getSymptomsList } = require('../controllers/symptomController');
const { normalizeInput } = require('../controllers/symptomNormalizationController');

// Public routes (no auth needed)
router.post('/predict', predictDisease);
router.get('/list', getSymptomsList);
router.post('/normalize', normalizeInput);

module.exports = router;
