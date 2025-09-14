const express = require('express');
const router = express.Router();
const { getCurrentUser, createUser } = require('../controllers/userController');
const requireAuth = require('../middleware/auth');

// All routes in this file require authentication
router.use(requireAuth);

router.get('/me', getCurrentUser);
router.post('/', createUser);

module.exports = router;