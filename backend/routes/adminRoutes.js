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
  getSystemStats,
  updateFine,
  deleteFine,
  updateUser,  // Add this line
  deleteUser   // Add this line
} = require('../controllers/adminController');
const requireAuth = require('../middleware/auth');
const requireAdmin = require('../middleware/adminAuth');

// All routes in this file require authentication
router.use(requireAuth);

// All routes in this file require admin role
router.use(requireAdmin);

// Monitor system - view all fines, payments, and officer activities
router.get('/fines', getAllFines);
router.put('/fines/:id', updateFine);
router.delete('/fines/:id', deleteFine);
router.get('/payments', getAllPayments);
router.get('/activities', getOfficerActivities);

// System statistics
router.get('/stats', getSystemStats);

// Generate reports
router.get('/reports', generateReport);

// User management
router.get('/users', getUserList);
router.post('/users', addUser);
router.put('/users/:id', updateUser);    // Add this line
router.delete('/users/:id', deleteUser); // Add this line
router.post('/users/:id/reset-password', resetPassword);

module.exports = router;