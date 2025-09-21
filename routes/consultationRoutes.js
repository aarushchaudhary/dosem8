// routes/consultationRoutes.js
const express = require('express');
const router = express.Router();
const { getConsultations, replyToConsultation } = require('../controllers/consultationController');
const auth = require('../middleware/authMiddleware');

// Protect all routes
router.use(auth);

router.route('/')
    .get(getConsultations);

router.route('/:id/reply')
    .post(replyToConsultation);

module.exports = router;