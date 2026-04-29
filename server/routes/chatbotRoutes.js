const express = require('express');
const router = express.Router();
const { chatWithMistral } = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

// @route   POST /api/chatbot
// @desc    Process a medical chat query with Mistral AI (cloud)
// @access  Patient (Protected)
router.post('/', protect, chatWithMistral);

module.exports = router;
