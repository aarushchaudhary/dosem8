// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { submitHealthReport, getSubmittedReports } = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware');
const premiumAuth = require('../middleware/premiumAuth');

// Protect all routes with both standard and premium auth
router.use(auth, premiumAuth);

router.route('/')
    .post(submitHealthReport)
    .get(getSubmittedReports);

module.exports = router;
