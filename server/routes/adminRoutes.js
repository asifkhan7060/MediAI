const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getAllDoctorsAdmin,
  approveDoctorRegistration,
  getAllAppointments,
  deleteUser,
  getAnalytics,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All admin routes require authentication + admin role
router.use(protect);
router.use(roleCheck('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/doctors', getAllDoctorsAdmin);
router.put('/doctors/:id/approve', approveDoctorRegistration);
router.get('/appointments', getAllAppointments);
router.get('/analytics', getAnalytics);

module.exports = router;
