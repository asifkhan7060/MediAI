const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create a Razorpay order
// @route   POST /api/payments/create-order
// @access  Patient
const createOrder = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required.',
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: req.user._id,
    }).populate('doctor', 'name fee');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this appointment.',
      });
    }

    const amount = appointment.amount || appointment.doctor?.fee || 500;

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${appointmentId}`,
      notes: {
        appointmentId: appointmentId.toString(),
        patientId: req.user._id.toString(),
      },
    });

    const payment = await Payment.create({
      appointment: appointmentId,
      patient: req.user._id,
      doctor: appointment.doctor._id,
      amount,
      razorpayOrderId: order.id,
      status: 'created',
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment._id,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order.',
    });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Patient
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data.',
      });
    }

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.',
      });
    }

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.',
      });
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'success';
    await payment.save();

    await Appointment.findByIdAndUpdate(payment.appointment, {
      paymentStatus: 'paid',
      paymentId: razorpayPaymentId,
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      data: payment,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed.',
    });
  }
};

// @desc    Get payment history for a patient
// @route   GET /api/payments/my
// @access  Patient
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ patient: req.user._id })
      .populate('appointment', 'date time status')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments.',
    });
  }
};

// @desc    Get Razorpay key (public)
// @route   GET /api/payments/key
// @access  Public
const getRazorpayKey = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { keyId: process.env.RAZORPAY_KEY_ID },
  });
};

// @desc    Demo payment (simulated online payment)
// @route   POST /api/payments/demo-pay
// @access  Patient
const demoPayment = async (req, res) => {
  try {
    const { appointmentId, paymentMethod } = req.body;

    if (!appointmentId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID and payment method are required.',
      });
    }

    const validMethods = ['card', 'upi', 'netbanking'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Allowed: ${validMethods.join(', ')}`,
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: req.user._id,
      status: { $in: ['confirmed', 'completed'] },
    }).populate('doctor', 'name fee');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not eligible for payment.',
      });
    }

    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this appointment.',
      });
    }

    const amount = appointment.amount || appointment.doctor?.fee || 500;

    // Generate demo Razorpay-style IDs
    const demoOrderId = `demo_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const demoPaymentId = `demo_pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payment = await Payment.create({
      appointment: appointmentId,
      patient: req.user._id,
      doctor: appointment.doctor._id,
      amount,
      razorpayOrderId: demoOrderId,
      razorpayPaymentId: demoPaymentId,
      razorpaySignature: 'demo_signature',
      paymentMethod,
      status: 'success',
    });

    await Appointment.findByIdAndUpdate(appointmentId, {
      paymentStatus: 'paid',
      paymentId: demoPaymentId,
    });

    res.status(200).json({
      success: true,
      message: 'Payment successful!',
      data: payment,
    });
  } catch (error) {
    console.error('Demo payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed.',
    });
  }
};

// @desc    Mark appointment as paid via cash (doctor confirms)
// @route   POST /api/payments/mark-cash
// @access  Doctor
const markCashPaid = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required.',
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: req.user._id,
      status: { $in: ['confirmed', 'completed'] },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not eligible.',
      });
    }

    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this appointment.',
      });
    }

    const amount = appointment.amount || 500;
    const cashPaymentId = `cash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payment = await Payment.create({
      appointment: appointmentId,
      patient: appointment.patient,
      doctor: req.user._id,
      amount,
      razorpayOrderId: '',
      razorpayPaymentId: cashPaymentId,
      razorpaySignature: '',
      paymentMethod: 'cash',
      status: 'success',
    });

    await Appointment.findByIdAndUpdate(appointmentId, {
      paymentStatus: 'paid',
      paymentId: cashPaymentId,
    });

    res.status(200).json({
      success: true,
      message: 'Cash payment recorded successfully.',
      data: payment,
    });
  } catch (error) {
    console.error('Mark cash paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record cash payment.',
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getMyPayments,
  getRazorpayKey,
  demoPayment,
  markCashPaid,
};
