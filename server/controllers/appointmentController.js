const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Patient
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, symptoms, predictedDisease } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, date, and time are required.',
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    // Check if slot is already taken
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another.',
      });
    }

    const appointment = await Appointment.create({
      doctor: doctorId,
      patient: req.user._id,
      date,
      time,
      symptoms: symptoms || '',
      predictedDisease: predictedDisease || '',
      amount: doctor.fee || 0,
    });

    // Populate and return
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'name specialization fee')
      .populate('patient', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully. Waiting for doctor confirmation.',
      data: populatedAppointment,
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment.',
    });
  }
};

// @desc    Get patient's appointments
// @route   GET /api/appointments/my
// @access  Patient
const getMyAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { patient: req.user._id };

    if (status) query.status = status;

    const total = await Appointment.countDocuments(query);
      const results = await Appointment.find(query)
        .populate('doctor', 'name avatar specialization fee experience')
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean();
        
      const Message = require('../models/Message');
      const appointments = await Promise.all(results.map(async (apt) => {
        let unreadCount = 0;
        if (apt.doctor && apt.doctor._id) {
          const roomId = [req.user._id.toString(), apt.doctor._id.toString()].sort().join('_');
          unreadCount = await Message.countDocuments({ roomId, receiver: req.user._id, read: false });
        }
        return { ...apt, unreadCount };
      }));

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

// @desc    Get doctor's appointments
// @route   GET /api/appointments/doctor
// @access  Doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const query = { doctor: req.user._id };

    if (status) query.status = status;
    if (date) query.date = date;

    const total = await Appointment.countDocuments(query);
    const results = await Appointment.find(query)
      .populate('patient', 'name email phone avatar gender')
      .sort({ date: -1, time: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    const Message = require('../models/Message');
    const appointments = await Promise.all(results.map(async (apt) => {
      let unreadCount = 0;
      if (apt.patient && apt.patient._id) {
        const roomId = [req.user._id.toString(), apt.patient._id.toString()].sort().join('_');
        unreadCount = await Message.countDocuments({ roomId, receiver: req.user._id, read: false });
      }
      return { ...apt, unreadCount };
    }));

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

// @desc    Update appointment status (accept/reject by doctor)
// @route   PUT /api/appointments/:id/status
// @access  Doctor
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const allowedStatuses = ['confirmed', 'rejected', 'completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`,
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;

    // Ensure the stored amount reflects the doctor's current fee
    if (status === 'completed' && (!appointment.amount || appointment.amount === 0)) {
      const doctor = await Doctor.findById(req.user._id);
      if (doctor) appointment.amount = doctor.fee || 0;
    }

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization');

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully.`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status.',
    });
  }
};

// @desc    Cancel appointment (by patient)
// @route   PUT /api/appointments/:id/cancel
// @access  Patient
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    if (['cancelled', 'completed', 'rejected'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an appointment that is already ${appointment.status}.`,
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully.',
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment.',
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private (patient or doctor involved)
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name avatar specialization fee experience')
      .populate('patient', 'name email phone avatar gender');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Only the patient, doctor, or admin can view
    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment.',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment.',
    });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentById,
};
