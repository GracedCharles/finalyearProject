const express = require('express');
const router = express.Router();
const { 
  getOffenseTypes,
  getOffenseTypeById,
  createOffenseType,
  updateOffenseType,
  deleteOffenseType
} = require('../controllers/offenseController');
const requireAuth = require('../middleware/auth');

// All routes in this file require authentication
router.use(requireAuth);

// Get all offense types
router.get('/', getOffenseTypes);

// Get offense type by ID
router.get('/:id', getOffenseTypeById);

// Create a new offense type (admin only)
router.post('/', createOffenseType);

// Update an offense type (admin only)
router.put('/:id', updateOffenseType);

// Delete an offense type (admin only)
router.delete('/:id', deleteOffenseType);

module.exports = router;