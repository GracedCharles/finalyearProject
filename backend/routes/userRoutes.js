const express = require('express');
const { getCurrentUser, createUser, setupUserProfile } = require('../controllers/userController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Add logging middleware
router.use((req, res, next) => {
  console.log('User routes middleware - Incoming request:', req.method, req.url);
  next();
});

// All routes require authentication
router.use(requireAuth);

// Get current user
router.get('/me', getCurrentUser);

// Create user (called when user first signs up)
router.post('/', createUser);

// Setup user profile (called after account setup)
router.post('/setup', (req, res, next) => {
  console.log('Received request to /setup endpoint');
  console.log('Request body:', req.body);
  next();
}, setupUserProfile);

module.exports = router;