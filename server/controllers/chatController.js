const Message = require('../models/Message');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Helper: generate a consistent room ID from two user IDs
const generateRoomId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

// @desc    Get chat history between two users
// @route   GET /api/chat/history/:otherUserId
// @access  Protected
const getChatHistory = async (req, res) => {
  try {
    const myId = req.user._id;
    const otherId = req.params.otherUserId;
    const roomId = generateRoomId(myId, otherId);
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ roomId });

    // Mark unread messages as read
    await Message.updateMany(
      { roomId, receiver: myId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      data: messages,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chat history.' });
  }
};

// @desc    Get list of conversations (unique chat partners)
// @route   GET /api/chat/conversations
// @access  Protected
const getConversations = async (req, res) => {
  try {
    const myId = req.user._id.toString();

    // Get all unique roomIds this user is part of
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$roomId',
          lastMessage: { $first: '$message' },
          lastTime: { $first: '$createdAt' },
          sender: { $first: '$sender' },
          receiver: { $first: '$receiver' },
          senderModel: { $first: '$senderModel' },
          receiverModel: { $first: '$receiverModel' },
        },
      },
      { $sort: { lastTime: -1 } },
    ]);

    // For each conversation, find the other user's info
    const conversations = [];
    for (const msg of messages) {
      const otherId = msg.sender.toString() === myId ? msg.receiver : msg.sender;
      const otherModel = msg.sender.toString() === myId ? msg.receiverModel : msg.senderModel;

      let otherUser = null;
      if (otherModel === 'Doctor') {
        otherUser = await Doctor.findById(otherId).select('name specialization avatar');
      } else {
        otherUser = await Patient.findById(otherId).select('name avatar');
      }

      if (otherUser) {
        // Count unread messages
        const unread = await Message.countDocuments({
          roomId: msg._id,
          receiver: req.user._id,
          read: false,
        });

        conversations.push({
          roomId: msg._id,
          otherUser: {
            id: otherUser._id,
            name: otherUser.name,
            specialization: otherUser.specialization || null,
            avatar: otherUser.avatar || '',
            role: otherModel.toLowerCase(),
          },
          lastMessage: msg.lastMessage,
          lastTime: msg.lastTime,
          unread,
        });
      }
    }

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations.' });
  }
};

// @desc    Send a message (REST fallback, primary via Socket.io)
// @route   POST /api/chat/send
// @access  Protected
const sendMessage = async (req, res) => {
  try {
    const { receiverId, receiverModel, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ success: false, message: 'Receiver ID and message are required.' });
    }

    const senderModel = req.user.role === 'doctor' ? 'Doctor' : 'Patient';
    const roomId = generateRoomId(req.user._id, receiverId);

    const newMessage = await Message.create({
      sender: req.user._id,
      senderModel,
      receiver: receiverId,
      receiverModel: receiverModel || (senderModel === 'Doctor' ? 'Patient' : 'Doctor'),
      message,
      roomId,
    });

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
};

module.exports = {
  getChatHistory,
  getConversations,
  sendMessage,
  generateRoomId,
};
