const mongoose = require('mongoose');

const hospitalSettingsSchema = new mongoose.Schema({
  name: { type: String, default: 'MediAI Central Hospital' },
  address: { type: String, default: '123 Healthcare Ave, Medical District' },
  phone: { type: String, default: '+1 (555) 012-3456' },
  email: { type: String, default: 'support@mediai.health' },
  about: { type: String, default: 'MediAI Central Hospital is a state-of-the-art facility dedicated to providing comprehensive and advanced medical care. We integrate modern AI technologies with compassionate healthcare to ensure the best outcomes for our patients.' },
  status: { type: String, default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('HospitalSettings', hospitalSettingsSchema);
