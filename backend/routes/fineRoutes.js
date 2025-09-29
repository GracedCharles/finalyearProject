const express = require('express');
const router = express.Router();
const { 
  issueFine,
  getOfficerFines,
  getFineById,
  getDashboardStats,
  processPayment,
  getAnalytics,
  getRecentActivity
} = require('../controllers/fineController');
const requireAuth = require('../middleware/auth');

// All routes in this file require authentication
router.use(requireAuth);

// Issue a new fine
router.post('/', issueFine);

// Get dashboard statistics for officer
router.get('/dashboard', getDashboardStats);

// Get recent activity for officer dashboard
router.get('/recent-activity', getRecentActivity);

// Get analytics data for officer
router.get('/analytics', getAnalytics);

// Get all fines issued by the officer
router.get('/my-fines', getOfficerFines);

// Get a specific fine by ID
router.get('/:id', getFineById);

// Process payment for a fine
router.post('/payment', processPayment);

module.exports = router;