// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { askAI } = require('../controllers/aiController');
const auth = require('../middleware/authMiddleware'); // Import the auth middleware

// @route   POST /api/ai/ask
// @desc    Submit a question to the AI assistant
// @access  Private
router.post('/ask', auth, askAI); // 'auth' middleware protects this route

module.exports = router;