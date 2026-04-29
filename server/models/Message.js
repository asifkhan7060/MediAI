const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel',
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Patient', 'Doctor'],
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverModel',
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['Patient', 'Doctor'],
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: 2000,
  },
  // Room ID = sorted combination of both user IDs for easy querying
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Compound index for efficient room-based queries
messageSchema.index({ roomId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
