const express = require('express');
const router = express.Router();
const { addReview, getDoctorReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public
router.get('/doctor/:doctorId', getDoctorReviews);

// Patient
router.post('/', protect, roleCheck('patient'), addReview);

module.exports = router;
