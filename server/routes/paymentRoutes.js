const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getMyPayments,
  getRazorpayKey,
  demoPayment,
  markCashPaid,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public
router.get('/key', getRazorpayKey);

// Patient routes
router.post('/create-order', protect, roleCheck('patient'), createOrder);
router.post('/verify', protect, roleCheck('patient'), verifyPayment);
router.post('/demo-pay', protect, roleCheck('patient'), demoPayment);
router.get('/my', protect, roleCheck('patient'), getMyPayments);

// Doctor routes
router.post('/mark-cash', protect, roleCheck('doctor'), markCashPaid);

module.exports = router;
