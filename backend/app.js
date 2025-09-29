const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http'); // Add this for Socket.IO
const { Server } = require('socket.io'); // Add this for Socket.IO
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const connectDB = require('./config/db');

// Debug environment variables
console.log('Environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'Not found');
console.log('PORT:', process.env.PORT || 'Not found, using default');
console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'Loaded' : 'Not found');

// Import routes
const userRoutes = require('./routes/userRoutes');
const fineRoutes = require('./routes/fineRoutes');
const driverRoutes = require('./routes/driverRoutes');
const adminRoutes = require('./routes/adminRoutes');
const offenseRoutes = require('./routes/offenseRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"]
  }
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Register user with their ID
  socket.on('registerUser', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from connected users
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Make io available to other modules
app.set('io', io);

// Middleware
app.use(cors({
  origin: true, // Allow all origins for debugging
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['Authorization']
}));
app.use(express.json());

// Add logging for all requests
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  console.log('Request headers:', req.headers);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/offenses', offenseRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Simple test endpoint without authentication
app.get('/test', (req, res) => {
  res.json({ status: 'OK', message: 'Test endpoint is working', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server is listening on 0.0.0.0:${PORT}`);
});

// Export io for use in other files
module.exports = { app, io, connectedUsers };