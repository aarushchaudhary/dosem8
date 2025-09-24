// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, refreshToken } = require('../controllers/authController'); // <-- Add refreshToken

// @route   POST /api/auth/register
// @desc    Register a new pharmacy
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Log in a pharmacy
router.post('/login', login);

// @route   POST /api/auth/refresh
// @desc    Get a new access token
router.post('/refresh', refreshToken);

module.exports = router;