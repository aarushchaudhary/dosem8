// routes/advertisementRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getAdvertisements, 
    createAdvertisement,
    getActiveAdvertisements
} = require('../controllers/advertisementController');
const auth = require('../middleware/authMiddleware');

// Route for patients to see active ads
router.get('/active', auth, getActiveAdvertisements);

// Protect all pharmacy-specific routes below
router.use(auth);

router.route('/')
    .get(getAdvertisements)
    .post(createAdvertisement);

module.exports = router;