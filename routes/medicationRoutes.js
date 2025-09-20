// routes/medicationRoutes.js
const express = require('express');
const router = express.Router();
const {
    getUserMedications,
    addMedication,
    updateMedication,
    deleteMedication
} = require('../controllers/medicationController');

const auth = require('../middleware/authMiddleware');

// Apply the auth middleware to all routes in this file
router.use(auth);

router.route('/')
    .get(getUserMedications)
    .post(addMedication);

router.route('/:id')
    .put(updateMedication)
    .delete(deleteMedication);

module.exports = router;