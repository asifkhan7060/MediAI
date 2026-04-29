const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc    Add a review for a doctor
// @route   POST /api/reviews
// @access  Patient
const addReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    if (!appointmentId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID and rating are required.',
      });
    }

    // Check appointment exists and is completed
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: req.user._id,
      status: 'completed',
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Completed appointment not found.',
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ appointment: appointmentId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this appointment.',
      });
    }

    const review = await Review.create({
      doctor: appointment.doctor,
      patient: req.user._id,
      appointment: appointmentId,
      rating,
      comment: comment || '',
    });

    // Update doctor's average rating
    const allReviews = await Review.find({ doctor: appointment.doctor });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Doctor.findByIdAndUpdate(appointment.doctor, {
      rating: Math.round(avgRating * 10) / 10,
      totalRatings: allReviews.length,
    });

    appointment.isReviewed = true;
    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully.',
      data: review,
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review.',
    });
  }
};

// @desc    Get reviews for a doctor
// @route   GET /api/reviews/doctor/:doctorId
// @access  Public
const getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId })
      .populate('patient', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews.',
    });
  }
};

module.exports = {
  addReview,
  getDoctorReviews,
};
