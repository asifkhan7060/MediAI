const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const HospitalSettings = require('../models/HospitalSettings');

// GET /api/support — public, anyone can read
router.get('/', async (req, res) => {
  try {
    let settings = await HospitalSettings.findOne();
    if (!settings) {
      // Auto-create with defaults on first access
      settings = await HospitalSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Get support settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to load support settings.' });
  }
});

// PUT /api/support — admin only
router.put('/', protect, roleCheck('admin'), async (req, res) => {
  try {
    const { name, address, phone, email, about, status } = req.body;

    let settings = await HospitalSettings.findOne();
    if (!settings) {
      settings = await HospitalSettings.create({ name, address, phone, email, about, status });
    } else {
      if (name !== undefined) settings.name = name;
      if (address !== undefined) settings.address = address;
      if (phone !== undefined) settings.phone = phone;
      if (email !== undefined) settings.email = email;
      if (about !== undefined) settings.about = about;
      if (status !== undefined) settings.status = status;
      await settings.save();
    }

    res.json({ success: true, data: settings, message: 'Support settings updated successfully.' });
  } catch (error) {
    console.error('Update support settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update support settings.' });
  }
});

module.exports = router;
