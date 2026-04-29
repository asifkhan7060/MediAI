const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    default: '',
    maxlength: 500,
  },
}, {
  timestamps: true,
});

// One review per appointment
reviewSchema.index({ appointment: 1 }, { unique: true });
reviewSchema.index({ doctor: 1 });

module.exports = mongoose.model('Review', reviewSchema);
