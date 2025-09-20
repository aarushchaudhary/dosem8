// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new pharmacy
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Log in a pharmacy
router.post('/login', login);

module.exports = router;