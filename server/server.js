const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const aiRoutes = require('./routes/aiRoutes');
const chatRoutes = require('./routes/chatRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const supportRoutes = require('./routes/supportRoutes');

// Import models for socket
const Message = require('./models/Message');

const app = express();

// ========================
// MIDDLEWARE
// ========================

// CORS - allow frontend to communicate with backend
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    // Allow any localhost port during development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    // Allow Vercel preview/production deployments
    if (origin.match(/\.vercel\.app$/)) {
      return callback(null, true);
    }
    // Check against CLIENT_URL for production
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    if (origin === clientUrl) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logger (development)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// ========================
// ROUTES
// ========================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MediAI Backend is running!',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/support', supportRoutes);

// ========================
// ERROR HANDLING
// ========================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ========================
// START SERVER
// ========================

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.io
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.match(/^http:\/\/localhost:\d+$/)) return callback(null, true);
      if (origin.match(/\.vercel\.app$/)) return callback(null, true);
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      if (origin === clientUrl) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  },
});

// ========================
// SOCKET.IO EVENTS
// ========================

// Track online users: { odejné => socketId } 
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // User joins with their userId
  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`  👤 User ${userId} is online (total: ${onlineUsers.size})`);
    // Broadcast updated online users list to ALL clients
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });

  // Join a specific chat room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`  📝 Socket ${socket.id} joined room: ${roomId}`);
  });

  // Handle sending a message
  socket.on('send_message', async (data) => {
    try {
      const { senderId, senderModel, receiverId, receiverModel, message, roomId } = data;

      // Save to database
      const newMessage = await Message.create({
        sender: senderId,
        senderModel,
        receiver: receiverId,
        receiverModel,
        message,
        roomId,
      });

      // Broadcast to room (including sender for confirmation)
      io.to(roomId).emit('receive_message', {
        _id: newMessage._id,
        sender: senderId,
        senderModel,
        receiver: receiverId,
        receiverModel,
        message,
        roomId,
        createdAt: newMessage.createdAt,
      });

      // Notify receiver if they are online but not in the room
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit('new_message_notification', {
          roomId,
          senderId,
          message,
        });
      }
    } catch (error) {
      console.error('Socket send_message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user_typing', { userId: data.userId });
  });

  socket.on('stop_typing', (data) => {
    socket.to(data.roomId).emit('user_stop_typing', { userId: data.userId });
  });

  // Disconnect
  socket.on('disconnect', () => {
    // Remove from online users
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    // Broadcast updated online users list after removal
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log(`🔌 Socket disconnected: ${socket.id} (online: ${onlineUsers.size})`);
  });
});

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log('');
      console.log('=============================================');
      console.log(`  🏥 MediAI Backend Server`);
      console.log(`  📡 Running on: http://localhost:${PORT}`);
      console.log(`  🗄️  Database: MongoDB`);
      console.log(`  🔌 Socket.io: Active`);
      console.log(`  🔗 Health: http://localhost:${PORT}/api/health`);
      console.log('=============================================');
      console.log('');
    });

    httpServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use!`);
        console.error(`   Run: taskkill /F /IM node.exe`);
        console.error(`   Then restart: npm run dev\n`);
      } else {
        console.error('Server error:', err);
      }
      process.exit(1);
    });

    const shutdown = () => {
      console.log('\n🛑 Shutting down server...');
      httpServer.close(() => process.exit(0));
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
