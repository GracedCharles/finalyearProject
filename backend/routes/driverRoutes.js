const express = require('express');
const router = express.Router();
const { 
  getFineByFineId,
  getPaymentHistory,
  searchFines,
  processPayment,
  getDriverDashboardStats
} = require('../controllers/driverController');

// These routes don't require authentication as they are for drivers looking up fines
// In a production environment, you might want to add rate limiting

// Get driver dashboard statistics
router.get('/dashboard', getDriverDashboardStats);

// Get a fine by fine ID or QR code
router.get('/fines/:fineId', getFineByFineId);

// Search fines by driver license number
router.get('/fines', searchFines);

// Get payment history for a driver
router.get('/payments/:driverLicenseNumber', getPaymentHistory);

// Process payment for a fine
router.post('/payments', processPayment);

module.exports = router;