const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  updateAvailability,
  getSpecializations,
  recommendDoctors,
  getNearbyDoctors,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes
router.get('/', getAllDoctors);
router.get('/specializations', getSpecializations);
router.get('/nearby', getNearbyDoctors);
router.post('/recommend', recommendDoctors);
router.get('/:id', getDoctorById);

// Doctor-only routes
router.put('/profile', protect, roleCheck('doctor'), updateDoctorProfile);
router.put('/availability', protect, roleCheck('doctor'), updateAvailability);

module.exports = router;
