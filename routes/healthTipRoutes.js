// routes/healthTipRoutes.js
const express = require('express');
const router = express.Router();
const { getHealthTips, createHealthTip } = require('../controllers/healthTipController');
const auth = require('../middleware/authMiddleware');

// Protect all routes with the user authentication middleware
router.use(auth);

// Route for getting and searching tips
router.route('/')
    .get(getHealthTips);
    // .post(createHealthTip); // <-- Uncomment when you build admin features

module.exports = router;