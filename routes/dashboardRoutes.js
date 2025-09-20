// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware'); // Import the auth middleware

// @route   GET /api/dashboard
// @desc    Get data for the pharmacy dashboard
// @access  Private
router.get('/', auth, getDashboardData); // 'auth' middleware runs first

module.exports = router;