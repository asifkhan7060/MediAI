const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Pre-built hospital database (expandable) — covers major Indian cities
const hospitalDatabase = [
  { name: 'AIIMS Delhi', lat: 28.5672, lng: 77.2100, phone: '011-26588500', type: 'Government', emergency: true },
  { name: 'Safdarjung Hospital', lat: 28.5685, lng: 77.2066, phone: '011-26707437', type: 'Government', emergency: true },
  { name: 'Apollo Hospital Delhi', lat: 28.5530, lng: 77.2840, phone: '011-26825858', type: 'Private', emergency: true },
  { name: 'Fortis Hospital Noida', lat: 28.5679, lng: 77.3260, phone: '0120-2400444', type: 'Private', emergency: true },
  { name: 'Max Super Speciality Hospital', lat: 28.5687, lng: 77.2130, phone: '011-26515050', type: 'Private', emergency: true },
  { name: 'Sir Ganga Ram Hospital', lat: 28.6385, lng: 77.1913, phone: '011-25861346', type: 'Private', emergency: true },
  { name: 'Medanta Hospital Gurugram', lat: 28.4395, lng: 77.0426, phone: '0124-4141414', type: 'Private', emergency: true },
  { name: 'BLK Hospital Delhi', lat: 28.6549, lng: 77.1866, phone: '011-30403040', type: 'Private', emergency: true },
  { name: 'Lilavati Hospital Mumbai', lat: 19.0509, lng: 72.8283, phone: '022-26751000', type: 'Private', emergency: true },
  { name: 'KEM Hospital Mumbai', lat: 19.0005, lng: 72.8422, phone: '022-24136051', type: 'Government', emergency: true },
  { name: 'Narayana Health Bangalore', lat: 12.8828, lng: 77.5995, phone: '080-71222222', type: 'Private', emergency: true },
  { name: 'CMC Vellore', lat: 12.9239, lng: 79.1352, phone: '0416-2281000', type: 'Private', emergency: true },
  { name: 'PGIMER Chandigarh', lat: 30.7649, lng: 76.7757, phone: '0172-2746018', type: 'Government', emergency: true },
  { name: 'Tata Memorial Hospital Mumbai', lat: 18.9985, lng: 72.8413, phone: '022-24177000', type: 'Government', emergency: true },
  { name: 'Ruby Hall Clinic Pune', lat: 18.5349, lng: 73.8827, phone: '020-66455100', type: 'Private', emergency: true },
];

// Haversine distance
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// @desc    Get nearest hospitals + emergency info
// @route   POST /api/emergency/activate
// @access  Protected (Patient)
const activateEmergency = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const patient = await Patient.findById(req.user._id);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // Find nearest hospitals
    let nearestHospitals = [];
    if (lat && lng) {
      nearestHospitals = hospitalDatabase
        .map(h => ({
          ...h,
          distance: Math.round(haversineDistance(lat, lng, h.lat, h.lng) * 10) / 10,
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);
    } else {
      nearestHospitals = hospitalDatabase.slice(0, 5).map(h => ({ ...h, distance: null }));
    }

    // Find nearest available doctors on our platform
    let nearestDoctors = [];
    if (lat && lng) {
      const doctors = await Doctor.find({
        isApproved: 'approved',
        available: true,
        'location.lat': { $ne: null },
        'location.lng': { $ne: null },
      }).select('name specialization phone location clinicAddress');

      nearestDoctors = doctors
        .map(doc => ({
          id: doc._id,
          name: doc.name,
          specialization: doc.specialization,
          phone: doc.phone,
          clinicAddress: doc.clinicAddress,
          distance: Math.round(haversineDistance(lat, lng, doc.location.lat, doc.location.lng) * 10) / 10,
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
    }

    // Emergency contacts
    const emergencyContacts = patient.emergencyContacts || [];

    // Emergency numbers
    const emergencyNumbers = {
      ambulance: '102',
      police: '100',
      fireStation: '101',
      emergencyUnified: '112',
      womenHelpline: '181',
    };

    // Log emergency event
    console.log(`🚨 EMERGENCY ACTIVATED by patient: ${patient.name} (${patient.email}) at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      data: {
        patient: {
          name: patient.name,
          phone: patient.phone,
          bloodGroup: patient.bloodGroup || 'Not set',
        },
        emergencyNumbers,
        nearestHospitals,
        nearestDoctors,
        emergencyContacts,
      },
    });
  } catch (error) {
    console.error('Emergency activation error:', error);
    res.status(500).json({ success: false, message: 'Emergency system error.' });
  }
};

// @desc    Update emergency contacts
// @route   PUT /api/emergency/contacts
// @access  Protected (Patient)
const updateEmergencyContacts = async (req, res) => {
  try {
    const { emergencyContacts, bloodGroup } = req.body;

    const updateData = {};
    if (emergencyContacts) updateData.emergencyContacts = emergencyContacts;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;

    const patient = await Patient.findByIdAndUpdate(req.user._id, updateData, { new: true });

    res.status(200).json({
      success: true,
      data: {
        emergencyContacts: patient.emergencyContacts,
        bloodGroup: patient.bloodGroup,
      },
    });
  } catch (error) {
    console.error('Update emergency contacts error:', error);
    res.status(500).json({ success: false, message: 'Failed to update emergency contacts.' });
  }
};

// @desc    Get emergency contacts
// @route   GET /api/emergency/contacts
// @access  Protected (Patient)
const getEmergencyContacts = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: {
        emergencyContacts: patient.emergencyContacts || [],
        bloodGroup: patient.bloodGroup || '',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch emergency contacts.' });
  }
};

module.exports = { activateEmergency, updateEmergencyContacts, getEmergencyContacts };
