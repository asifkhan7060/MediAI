const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentById,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Patient routes
router.post('/', protect, roleCheck('patient'), bookAppointment);
router.get('/my', protect, roleCheck('patient'), getMyAppointments);
router.put('/:id/cancel', protect, roleCheck('patient'), cancelAppointment);

// Doctor routes
router.get('/doctor', protect, roleCheck('doctor'), getDoctorAppointments);
router.put('/:id/status', protect, roleCheck('doctor'), updateAppointmentStatus);

// Shared (patient, doctor, admin)
router.get('/:id', protect, getAppointmentById);

module.exports = router;
