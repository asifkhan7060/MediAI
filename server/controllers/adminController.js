const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Admin = require('../models/User');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments({ isApproved: 'approved' });
    const pendingDoctors = await Doctor.countDocuments({ isApproved: 'pending' });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    // Revenue — sum amounts from completed/paid appointments
    // (Payment collection is only used if a real payment gateway is integrated)
    const revenueResult = await Appointment.aggregate([
      { $match: { status: 'completed', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Recent appointments
    const recentAppointments = await Appointment.find()
      .populate('doctor', 'name specialization')
      .populate('patient', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        pendingDoctors,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        cancelledAppointments,
        totalRevenue,
        recentAppointments,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats.',
    });
  }
};

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const searchQuery = search
      ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ]
      }
      : {};

    let users = [];

    if (!role || role === 'patient') {
      const patients = await Patient.find(searchQuery).select('-password').lean();
      users = users.concat(patients.map(p => ({ ...p, role: 'patient' })));
    }
    if (!role || role === 'doctor') {
      const doctors = await Doctor.find(searchQuery).select('-password').lean();
      users = users.concat(doctors.map(d => ({ ...d, role: 'doctor' })));
    }
    if (!role || role === 'admin') {
      const admins = await Admin.find(searchQuery).select('-password').lean();
      users = users.concat(admins.map(a => ({ ...a, role: 'admin' })));
    }

    // Sort by createdAt desc
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = users.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginated = users.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
    });
  }
};

// @desc    Get all doctors (including pending)
// @route   GET /api/admin/doctors
// @access  Admin
const getAllDoctorsAdmin = async (req, res) => {
  try {
    const { approval, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (approval) query.isApproved = approval;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Transform to match frontend expectations (doctorProfile nested format)
    const formatted = doctors.map(doc => ({
      _id: doc._id,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      role: 'doctor',
      doctorProfile: {
        specialization: doc.specialization,
        experience: doc.experience,
        fee: doc.fee,
        qualification: doc.qualification,
        isApproved: doc.isApproved,
        rating: doc.rating,
        totalRatings: doc.totalRatings,
      },
    }));

    res.status(200).json({
      success: true,
      data: formatted,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors.',
    });
  }
};

// @desc    Approve or reject doctor registration
// @route   PUT /api/admin/doctors/:id/approve
// @access  Admin
const approveDoctorRegistration = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be "approved" or "rejected".',
      });
    }

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    doctor.isApproved = status;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor ${status} successfully.`,
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor approval status.',
    });
  }
};

// @desc    Get all appointments (admin view)
// @route   GET /api/admin/appointments
// @access  Admin
const getAllAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (date) query.date = date;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization')
      .populate('patient', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments.',
    });
  }
};

// @desc    Delete a user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    // Try to find in all collections
    let user = await Patient.findById(id);
    let Model = Patient;

    if (!user) {
      user = await Doctor.findById(id);
      Model = Doctor;
    }
    if (!user) {
      user = await Admin.findById(id);
      Model = Admin;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an admin user.',
      });
    }

    await Model.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user.',
    });
  }
};

// @desc    Get advanced analytics for AI dashboard
// @route   GET /api/admin/analytics
// @access  Admin
const getAnalytics = async (req, res) => {
  try {
    // ── 1. Appointments by Status (Pie Chart) ──
    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // ── 2. Appointments per Month (Line Chart - last 6 months) ──
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const appointmentTrends = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendsFormatted = appointmentTrends.map(t => ({
      month: `${monthNames[t._id.month - 1]} ${t._id.year}`,
      total: t.total,
      completed: t.completed,
      cancelled: t.cancelled,
    }));

    // ── 3. Top Specializations by Appointments (Bar Chart) ──
    const topSpecializations = await Appointment.aggregate([
      { $lookup: { from: 'doctors', localField: 'doctor', foreignField: '_id', as: 'doc' } },
      { $unwind: '$doc' },
      { $group: { _id: '$doc.specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // ── 4. Top Rated Doctors ──
    const topDoctors = await Doctor.find({ isApproved: 'approved' })
      .select('name specialization rating totalRatings')
      .sort({ rating: -1, totalRatings: -1 })
      .limit(5);

    // ── 5. Patient Growth (last 6 months) ──
    const patientGrowth = await Patient.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const patientGrowthFormatted = patientGrowth.map(p => ({
      month: `${monthNames[p._id.month - 1]} ${p._id.year}`,
      newPatients: p.count,
    }));

    // ── 6. AI-Generated Insights ──
    const totalApts = await Appointment.countDocuments();
    const completedApts = await Appointment.countDocuments({ status: 'completed' });
    const cancelledApts = await Appointment.countDocuments({ status: 'cancelled' });
    const totalPats = await Patient.countDocuments();
    const totalDocs = await Doctor.countDocuments({ isApproved: 'approved' });

    const completionRate = totalApts > 0 ? ((completedApts / totalApts) * 100).toFixed(1) : 0;
    const cancellationRate = totalApts > 0 ? ((cancelledApts / totalApts) * 100).toFixed(1) : 0;

    const topSpec = topSpecializations[0];
    const insights = [
      `Appointment completion rate is ${completionRate}%. ${completionRate >= 70 ? 'Great performance!' : 'Consider follow-up reminders to improve.'}`,
      `Cancellation rate is ${cancellationRate}%. ${cancellationRate > 20 ? 'This is high — investigate common reasons.' : 'This is within acceptable range.'}`,
      topSpec ? `"${topSpec._id}" is the most in-demand specialization with ${topSpec.count} appointments.` : 'No specialization data available yet.',
      `Patient-to-doctor ratio is ${totalDocs > 0 ? (totalPats / totalDocs).toFixed(1) : 'N/A'}:1. ${totalPats / totalDocs > 50 ? 'Consider onboarding more doctors.' : 'Ratio is healthy.'}`,
      `${totalPats} patients and ${totalDocs} active doctors are on the platform.`,
    ];

    res.status(200).json({
      success: true,
      data: {
        appointmentsByStatus: appointmentsByStatus.map(s => ({ name: s._id, value: s.count })),
        appointmentTrends: trendsFormatted,
        topSpecializations: topSpecializations.map(s => ({ name: s._id || 'Unknown', appointments: s.count })),
        topDoctors: topDoctors.map(d => ({ name: d.name, specialization: d.specialization, rating: d.rating, totalRatings: d.totalRatings })),
        patientGrowth: patientGrowthFormatted,
        insights,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllDoctorsAdmin,
  approveDoctorRegistration,
  getAllAppointments,
  deleteUser,
  getAnalytics,
};
