// routes/pharmacyReportRoutes.js
const express = require('express');
const router = express.Router();
const { getPharmacyReport } = require('../controllers/pharmacyReportController');
const auth = require('../middleware/authMiddleware');
const premiumPharmacyAuth = require('../middleware/premiumPharmacyAuth');

// Protect route with both standard and premium pharmacy auth
router.get('/', [auth, premiumPharmacyAuth], getPharmacyReport);

module.exports = router;