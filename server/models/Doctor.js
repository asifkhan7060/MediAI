const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
    select: false,
  },
  googleId: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    default: 'doctor',
    immutable: true,
  },
  phone: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    default: '',
  },
  // Doctor-specific fields (at root level now — no nested doctorProfile)
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    default: '',
  },
  experience: {
    type: Number,
    default: 0,
  },
  fee: {
    type: Number,
    default: 500,
  },
  bio: {
    type: String,
    default: '',
  },
  qualification: {
    type: String,
    default: '',
  },
  clinicAddress: {
    type: String,
    default: '',
  },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  available: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 4.0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' },
    isAvailable: { type: Boolean, default: true },
  }],
  isApproved: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Hash password before saving
doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
doctorSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
doctorSchema.methods.toJSON = function () {
  const doc = this.toObject();
  delete doc.password;
  return doc;
};

module.exports = mongoose.model('Doctor', doctorSchema);
