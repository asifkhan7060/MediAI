const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { activateEmergency, updateEmergencyContacts, getEmergencyContacts } = require('../controllers/emergencyController');

router.post('/activate', protect, activateEmergency);
router.get('/contacts', protect, getEmergencyContacts);
router.put('/contacts', protect, updateEmergencyContacts);

module.exports = router;
