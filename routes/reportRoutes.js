// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { getHealthReport } = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware');
const premiumAuth = require('../middleware/premiumAuth');

// Protect route with both standard and premium auth
router.get('/', [auth, premiumAuth], getHealthReport);

module.exports = router;