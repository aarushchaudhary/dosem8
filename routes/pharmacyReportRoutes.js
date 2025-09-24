// routes/pharmacyReportRoutes.js
const express = require('express');
const router = express.Router();
const { getPatientHealthReports, generatePharmacistReport } = require('../controllers/pharmacyReportController');
const auth = require('../middleware/authMiddleware');

// Protect all routes with pharmacy auth
router.use(auth);

router.route('/')
    .get(getPatientHealthReports);

router.route('/:id/generate')
    .post(generatePharmacistReport);

module.exports = router;
