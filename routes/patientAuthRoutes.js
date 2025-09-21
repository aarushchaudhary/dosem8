// routes/patientAuthRoutes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/patientAuthController');

// @route   POST /api/patient/register
// @desc    Register a new patient
router.post('/register', register);

// @route   POST /api/patient/login
// @desc    Log in a patient
router.post('/login', login);

module.exports = router;