// routes/pharmacyRoutes.js
const express = require('express');
const router = express.Router();
const { getPharmacies, getNearbyPharmacies } = require('../controllers/pharmacyController');
const auth = require('../middleware/authMiddleware');

// All routes here are protected and require a valid token
router.use(auth);

router.route('/')
    .get(getPharmacies);

router.route('/nearby')
    .get(getNearbyPharmacies);

module.exports = router;
