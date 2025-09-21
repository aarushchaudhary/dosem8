// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

// Protect all routes
router.use(auth);

router.route('/')
    .get(getNotifications);

router.route('/:id/read')
    .put(markAsRead);

module.exports = router;