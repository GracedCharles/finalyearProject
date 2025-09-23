const express = require('express');
const { getCurrentUser, createUser, setupUserProfile } = require('../controllers/userController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Add logging middleware
router.use((req, res, next) => {
  console.log('User routes middleware - Incoming request:', req.method, req.url);
  next();
});

// Get current user (requires authentication)
router.get('/me', requireAuth, getCurrentUser);

// Create user (does NOT require authentication - this is called when user first signs up)
router.post('/', createUser);

// Setup user profile (requires authentication)
router.post('/setup', requireAuth, (req, res, next) => {
  console.log('Received request to /setup endpoint');
  console.log('Request body:', req.body);
  next();
}, setupUserProfile);

module.exports = router;