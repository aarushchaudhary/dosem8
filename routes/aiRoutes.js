// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { askAI, askAIEnhanced, checkInteractions } = require('../controllers/aiController'); // <-- Import the new function
const auth = require('../middleware/authMiddleware');
const premiumAuth = require('../middleware/premiumAuth'); // <-- Import the new premium middleware

// --- Standard Route ---
// @route   POST /api/ai/ask
// @desc    Submit a question to the standard AI assistant
// @access  Private (for all logged-in users)
router.post('/ask', auth, askAI);

// --- NEW: Interaction Checker Route ---
// @route   POST /api/ai/check-interactions
// @desc    Submit a list of drugs/items to check for interactions
// @access  Private (for all logged-in users)
router.post('/check-interactions', auth, checkInteractions);

// --- Premium Route ---
// @route   POST /api/ai/ask-enhanced
// @desc    Submit a question to the enhanced AI assistant
// @access  Premium Only
// This route uses an array of middleware. It first checks if the user is logged in (auth),
// then it checks if they have a premium subscription (premiumAuth).
router.post('/ask-enhanced', [auth, premiumAuth], askAIEnhanced);


module.exports = router;