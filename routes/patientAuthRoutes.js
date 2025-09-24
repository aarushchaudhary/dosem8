// routes/patientAuthRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, refreshToken } = require('../controllers/patientAuthController'); // <-- Add refreshToken

// @route   POST /api/patient/register
// @desc    Register a new patient
router.post('/register', register);

// @route   POST /api/patient/login
// @desc    Log in a patient
router.post('/login', login);

// @route   POST /api/patient/refresh
// @desc    Get a new access token
router.post('/refresh', refreshToken);

module.exports = router;