// routes/advertisementRoutes.js
const express = require('express');
const router = express.Router();
const { getAdvertisements, createAdvertisement } = require('../controllers/advertisementController');
const auth = require('../middleware/authMiddleware');

// Protect all routes
router.use(auth);

router.route('/')
    .get(getAdvertisements)
    .post(createAdvertisement);

module.exports = router;