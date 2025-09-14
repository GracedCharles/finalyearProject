const express = require('express');
const router = express.Router();
const { 
  getAllFines,
  getAllPayments,
  getOfficerActivities,
  generateReport,
  getUserList,
  addUser,
  removeUser,
  resetPassword,
  getSystemStats
} = require('../controllers/adminController');
const requireAuth = require('../middleware/auth');

// All routes in this file require authentication
router.use(requireAuth);

// Monitor system - view all fines, payments, and officer activities
router.get('/fines', getAllFines);
router.get('/payments', getAllPayments);
router.get('/activities', getOfficerActivities);

// System statistics
router.get('/stats', getSystemStats);

// Generate reports
router.get('/reports', generateReport);

// User management
router.get('/users', getUserList);
router.post('/users', addUser);
router.delete('/users/:id', removeUser);
router.post('/users/:id/reset-password', resetPassword);

module.exports = router;