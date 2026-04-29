const Doctor = require('../models/Doctor');
const Review = require('../models/Review');

// @desc    Get all approved doctors (public listing)
// @route   GET /api/doctors
// @access  Public
const getAllDoctors = async (req, res) => {
  try {
    const { specialization, available, search, sort, page = 1, limit = 20 } = req.query;

    // Build query — show all doctors from database
    const query = {};

    if (specialization && specialization !== 'All') {
      query.specialization = specialization;
    }

    if (available !== undefined) {
      query.available = available === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort options — default: newest first so new registrations appear at top
    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'experience') sortOption = { experience: -1 };
    if (sort === 'fee_low') sortOption = { fee: 1 };
    if (sort === 'fee_high') sortOption = { fee: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Doctor.countDocuments(query);

    const doctors = await Doctor.find(query)
      .select('-password')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Transform to frontend-friendly format
    const formattedDoctors = doctors.map(doc => ({
      id: doc._id,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      avatar: doc.avatar,
      gender: doc.gender,
      specialization: doc.specialization || '',
      experience: doc.experience || 0,
      fee: doc.fee || 0,
      bio: doc.bio || '',
      qualification: doc.qualification || '',
      clinicAddress: doc.clinicAddress || '',
      available: doc.available || false,
      rating: doc.rating || 4.0,
      totalRatings: doc.totalRatings || 0,
      schedule: doc.schedule || [],
      isApproved: doc.isApproved || 'pending',
      location: doc.location || { lat: null, lng: null },
    }));

    res.status(200).json({
      success: true,
      data: formattedDoctors,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors.',
    });
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    // Get reviews for this doctor
    const reviews = await Review.find({ doctor: doctor._id })
      .populate('patient', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    const formatted = {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      avatar: doctor.avatar,
      gender: doctor.gender,
      specialization: doctor.specialization || '',
      experience: doctor.experience || 0,
      fee: doctor.fee || 0,
      bio: doctor.bio || '',
      qualification: doctor.qualification || '',
      clinicAddress: doctor.clinicAddress || '',
      available: doctor.available || false,
      rating: doctor.rating || 4.0,
      totalRatings: doctor.totalRatings || 0,
      schedule: doctor.schedule || [],
      isApproved: doctor.isApproved || 'pending',
      reviews,
    };

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor.',
    });
  }
};

// @desc    Update doctor profile (by doctor themselves)
// @route   PUT /api/doctors/profile
// @access  Doctor
const updateDoctorProfile = async (req, res) => {
  try {
    const { specialization, experience, fee, bio, qualification, clinicAddress } = req.body;
    const updateData = {};

    if (specialization) updateData.specialization = specialization;
    if (experience !== undefined) updateData.experience = experience;
    if (fee !== undefined) updateData.fee = fee;
    if (bio !== undefined) updateData.bio = bio;
    if (qualification !== undefined) updateData.qualification = qualification;
    if (clinicAddress !== undefined) updateData.clinicAddress = clinicAddress;

    // Allow location update
    if (req.body.location) {
      updateData.location = req.body.location;
    }

    const doctor = await Doctor.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully.',
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor profile.',
    });
  }
};

// @desc    Update availability schedule
// @route   PUT /api/doctors/availability
// @access  Doctor
const updateAvailability = async (req, res) => {
  try {
    const { available, schedule } = req.body;
    const updateData = {};

    if (available !== undefined) updateData.available = available;
    if (schedule) updateData.schedule = schedule;

    const doctor = await Doctor.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully.',
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update availability.',
    });
  }
};

// @desc    Get all specializations
// @route   GET /api/doctors/specializations
// @access  Public
const getSpecializations = async (req, res) => {
  try {
    const specializations = [
      'General Physician',
      'Dermatologist',
      'Cardiologist',
      'Neurologist',
      'Orthopedic',
      'Gastroenterologist',
      'Endocrinologist',
      'Pulmonologist',
      'Hepatologist',
      'Allergist',
      'Urologist',
      'Proctologist',
      'Infectious Disease Specialist',
      'Pediatrician',
      'Gynecologist',
      'Psychiatrist',
      'Ophthalmologist',
      'ENT Specialist',
      'Dentist',
    ];

    res.status(200).json({
      success: true,
      data: specializations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch specializations.',
    });
  }
};

// @desc    Recommend top doctors based on symptoms (scored ranking)
// @route   POST /api/doctors/recommend
// @access  Public
const recommendDoctors = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a symptoms array.',
      });
    }

    // Safety layer: require at least 2 symptoms
    if (symptoms.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 2 symptoms for an accurate prediction.',
      });
    }

    const inputSymptoms = symptoms.map(s => s.toLowerCase().trim());

    // ── Step 1: LLM-based disease prediction ──
    const { callGroqPredict, getDoctorType } = require('./symptomController');

    console.log(`🔍 Groq LLM Recommend for: [${inputSymptoms.join(', ')}]`);

    const llmPredictions = await callGroqPredict(inputSymptoms);

    if (llmPredictions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          predictions: [],
          recommendedDoctors: [],
          message: 'Could not determine conditions. Please try adding more symptoms.',
        },
      });
    }

    // Map LLM output to predictions with doctor types
    const predictions = llmPredictions.map(pred => ({
      disease: pred.disease,
      confidence: pred.confidence,
      reason: pred.reason,
      doctorType: getDoctorType(pred.disease),
    }));

    console.log(`  ✅ LLM Predictions: ${predictions.map(p => `${p.disease} (${p.confidence})`).join(', ')}`);

    // ── Step 2: Get unique specializations to search for ──
    const specializations = [...new Set(predictions.map(p => p.doctorType))];

    // ── Step 3: Fetch approved & available doctors in those specializations ──
    const doctors = await Doctor.find({
      specialization: { $in: specializations },
      isApproved: 'approved',
      available: true,
    }).select('-password');

    // ── Step 4: Score each doctor ──
    // Formula: Score = (rating * 0.5) + (experience * 0.3) + (availability * 0.2)
    const maxExperience = Math.max(...doctors.map(d => d.experience || 1), 1);

    const scoredDoctors = doctors.map(doc => {
      const ratingScore = ((doc.rating || 0) / 5) * 0.5;           // Normalized 0–0.5
      const expScore = ((doc.experience || 0) / maxExperience) * 0.3; // Normalized 0–0.3
      const availScore = doc.available ? 0.2 : 0;                   // Binary 0 or 0.2
      const totalScore = ratingScore + expScore + availScore;

      return {
        id: doc._id,
        name: doc.name,
        specialization: doc.specialization,
        experience: doc.experience || 0,
        rating: doc.rating || 0,
        totalRatings: doc.totalRatings || 0,
        available: doc.available,
        fee: doc.fee || 0,
        bio: doc.bio || '',
        avatar: doc.avatar || '',
        qualification: doc.qualification || '',
        score: Math.round(totalScore * 100) / 100,
      };
    });

    // ── Step 5: Sort by score descending, return all doctors (frontend handles top 3 vs see all) ──
    scoredDoctors.sort((a, b) => b.score - a.score);

    res.status(200).json({
      success: true,
      data: {
        predictions,
        recommendedDoctors: scoredDoctors,
      },
    });
  } catch (error) {
    console.error('Recommend doctors error:', error);

    // If Groq API is unreachable
    if (error.message && (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed') || error.message.includes('GROQ_API_KEY'))) {
      return res.status(503).json({
        success: false,
        message: 'AI service is currently unavailable. Please try again later.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations.',
    });
  }
};

// Haversine formula to calculate distance between two lat/lng points (in km)
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @desc    Find nearby doctors based on lat/lng
// @route   GET /api/doctors/nearby?lat=xx&lng=yy&radius=10
// @access  Public
const getNearbyDoctors = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required.',
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius);

    // Get all approved doctors that have location set
    const doctors = await Doctor.find({
      isApproved: 'approved',
      'location.lat': { $ne: null },
      'location.lng': { $ne: null },
    }).select('-password');

    // Calculate distance and filter by radius
    const nearby = doctors
      .map(doc => {
        const distance = haversineDistance(userLat, userLng, doc.location.lat, doc.location.lng);
        return {
          id: doc._id,
          name: doc.name,
          specialization: doc.specialization || '',
          experience: doc.experience || 0,
          fee: doc.fee || 0,
          rating: doc.rating || 0,
          totalRatings: doc.totalRatings || 0,
          available: doc.available || false,
          clinicAddress: doc.clinicAddress || '',
          location: doc.location,
          distance: Math.round(distance * 10) / 10, // 1 decimal km
        };
      })
      .filter(d => d.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      data: nearby,
      total: nearby.length,
    });
  } catch (error) {
    console.error('Nearby doctors error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch nearby doctors.' });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  updateAvailability,
  getSpecializations,
  recommendDoctors,
  getNearbyDoctors,
};
