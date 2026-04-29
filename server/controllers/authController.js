const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Admin = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    Register a new user (patient or doctor)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, gender, specialization, experience, fee, bio, qualification, clinicAddress } = req.body;

    // Check if email already exists in any collection
    const existingPatient = await Patient.findOne({ email });
    const existingDoctor = await Doctor.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });

    if (existingPatient || existingDoctor || existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email.',
      });
    }

    // Validate role
    const allowedRoles = ['patient', 'doctor'];
    const userRole = allowedRoles.includes(role) ? role : 'patient';

    let user;

    if (userRole === 'doctor') {
      user = await Doctor.create({
        name,
        email,
        password,
        phone: phone || '',
        gender: gender || '',
        specialization: specialization || 'General Physician',
        experience: experience || 0,
        fee: fee || 500,
        bio: bio || '',
        qualification: qualification || '',
        clinicAddress: clinicAddress || '',
        available: true,
        isApproved: 'pending',
        schedule: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Saturday', startTime: '09:00', endTime: '13:00', isAvailable: true },
          { day: 'Sunday', startTime: '00:00', endTime: '00:00', isAvailable: false },
        ],
      });
    } else {
      user = await Patient.create({
        name,
        email,
        password,
        phone: phone || '',
        gender: gender || '',
      });
    }

    const token = generateToken(user._id, userRole);

    res.status(201).json({
      success: true,
      message: userRole === 'doctor'
        ? 'Doctor registered successfully. Awaiting admin approval.'
        : 'Registration successful.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed.',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Search across all collections
    let user = await Patient.findOne({ email }).select('+password');
    let userRole = 'patient';

    if (!user) {
      user = await Doctor.findOne({ email }).select('+password');
      userRole = 'doctor';
    }

    if (!user) {
      user = await Admin.findOne({ email }).select('+password');
      userRole = 'admin';
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if doctor is approved
    if (userRole === 'doctor') {
      if (user.isApproved === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your doctor account is pending admin approval.',
        });
      }
      if (user.isApproved === 'rejected') {
        return res.status(403).json({
          success: false,
          message: 'Your doctor registration has been rejected by admin.',
        });
      }
    }

    const token = generateToken(user._id, userRole);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed.',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile.',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, gender, dateOfBirth, avatar } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (gender !== undefined) updateData.gender = gender;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Use the correct model based on role
    const role = req.user.role;
    let Model;
    if (role === 'patient') Model = Patient;
    else if (role === 'doctor') Model = Doctor;
    else Model = Admin;

    const user = await Model.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password.',
      });
    }

    const role = req.user.role;
    let Model;
    if (role === 'patient') Model = Patient;
    else if (role === 'doctor') Model = Doctor;
    else Model = Admin;

    const user = await Model.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password.',
    });
  }
};

// @desc    Login/Register via Google (Firebase)
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { idToken, email, name, picture, googleId } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required from Google authentication.',
      });
    }

    const lowerEmail = email.toLowerCase().trim();

    // ── Determine admin emails early ──
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0);

    const isAdminEmail = adminEmails.includes(lowerEmail);

    let user = null;
    let userRole = null;

    // ── PRIORITY: If email is in ADMIN_EMAILS → always treat as admin ──
    if (isAdminEmail) {
      user = await Admin.findOne({ email: lowerEmail });
      if (user) {
        userRole = 'admin';
      } else {
        // Create Admin account on-the-fly
        user = await Admin.create({
          name: name || lowerEmail.split('@')[0],
          email: lowerEmail,
          googleId: googleId || null,
          phone: '',
        });
        userRole = 'admin';
      }
    } else {
      // ── Normal flow: check Patient → Doctor → Admin ──
      // 1. Check Patient
      user = await Patient.findOne({ email: lowerEmail });
      if (user) userRole = 'patient';

      // 2. Check Doctor
      if (!user) {
        user = await Doctor.findOne({ email: lowerEmail });
        if (user) userRole = 'doctor';
      }

      // 3. Check Admin (fallback for non-ADMIN_EMAILS admins in DB)
      if (!user) {
        user = await Admin.findOne({ email: lowerEmail });
        if (user) userRole = 'admin';
      }
    }

    // ── If user exists → link Google ID if not already linked, then login ──
    if (user) {
      // Link Google ID if not already set
      if (googleId && !user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      // Update avatar from Google if user doesn't have one
      if (picture && !user.avatar) {
        user.avatar = picture;
        await user.save();
      }

      // Check if doctor is approved
      if (userRole === 'doctor') {
        if (user.isApproved === 'pending') {
          return res.status(403).json({
            success: false,
            message: 'Your doctor account is pending admin approval.',
          });
        }
        if (user.isApproved === 'rejected') {
          return res.status(403).json({
            success: false,
            message: 'Your doctor registration has been rejected by admin.',
          });
        }
      }

      const token = generateToken(user._id, userRole);
      user.password = undefined;

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: { user, token },
      });
    }

    // ── User doesn't exist → create new Patient account ──
    // (Admin emails are already handled above, so this only runs for non-admin emails)
    user = await Patient.create({
      name: name || lowerEmail.split('@')[0],
      email: lowerEmail,
      googleId: googleId || null,
      avatar: picture || '',
      phone: '',
      gender: '',
    });
    userRole = 'patient';

    const token = generateToken(user._id, userRole);
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Account created successfully via Google.',
      data: { user, token },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Google login failed.',
    });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getProfile,
  updateProfile,
  changePassword,
};
