const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Admin = require('../models/User'); // Admin model

// Map of collection to model
const modelMap = {
  patient: Patient,
  doctor: Doctor,
  admin: Admin,
};

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.',
    });
  }

  try {
    // Verify token — token now contains { id, role, collection }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Determine which model to query based on the role stored in token
    const role = decoded.role || 'patient';
    const Model = modelMap[role];

    if (!Model) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user role in token.',
      });
    }

    const user = await Model.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Token is invalid or expired.',
    });
  }
};

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = { protect, generateToken };
