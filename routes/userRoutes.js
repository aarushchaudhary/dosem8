// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// The 'auth' middleware is applied to all routes in this file,
// ensuring only authenticated users can access them.

// @route   GET /api/user/profile
// @desc    Get a user's profile
router.get('/profile', auth, getUserProfile);

// @route   PUT /api/user/profile
// @desc    Update a user's profile
router.put('/profile', auth, updateUserProfile);


module.exports = router;