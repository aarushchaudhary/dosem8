// routes/pharmacyHealthTipRoutes.js
const express = require('express');
const router = express.Router();
const {
    getPharmacyHealthTips,
    createHealthTip,
    deleteHealthTip
} = require('../controllers/pharmacyHealthTipController');
const auth = require('../middleware/authMiddleware');

// Protect all routes
router.use(auth);

router.route('/')
    .get(getPharmacyHealthTips)
    .post(createHealthTip);

router.route('/:id')
    .delete(deleteHealthTip);

module.exports = router;