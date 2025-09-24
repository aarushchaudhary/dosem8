// routes/consultationRoutes.js
const express = require('express');
const router = express.Router();
const {
    getConsultations,
    replyToConsultation,
    createConsultation,
    getPatientConsultations,
    getConsultationById
} = require('../controllers/consultationController');
const auth = require('../middleware/authMiddleware');

// Protect all routes in this file
router.use(auth);

// --- Routes for Pharmacies ---
router.route('/')
    .get(getConsultations); // Gets all consultation threads for the logged-in pharmacy

// --- Routes for Patients ---
router.route('/patient')
    .get(getPatientConsultations) // Gets all consultation threads for the logged-in patient
    .post(createConsultation);   // Starts a new conversation with a pharmacy

// --- Shared Routes ---
router.route('/:id')
    .get(getConsultationById); // Gets a single conversation by its ID

router.route('/:id/reply')
    .post(replyToConsultation); // Adds a new message to a conversation

module.exports = router;