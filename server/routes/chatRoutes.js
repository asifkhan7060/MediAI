const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getChatHistory, getConversations, sendMessage } = require('../controllers/chatController');

// All chat routes are protected
router.get('/conversations', protect, getConversations);
router.get('/history/:otherUserId', protect, getChatHistory);
router.post('/send', protect, sendMessage);

module.exports = router;
