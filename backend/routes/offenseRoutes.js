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

// Get all offense types (public - no authentication required)
router.get('/', getOffenseTypes);

// Get offense type by ID (public - no authentication required)
router.get('/:id', getOffenseTypeById);

// Routes below require authentication
router.use(requireAuth);

// Create a new offense type (admin only)
router.post('/', createOffenseType);

// Update an offense type (admin only)
router.put('/:id', updateOffenseType);

// Delete an offense type (admin only)
router.delete('/:id', deleteOffenseType);

module.exports = router;