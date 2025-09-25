// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { askAI, askAIEnhanced, checkInteractions, extractFromImage, checkFoodInteraction } = require('../controllers/aiController');
const auth = require('../middleware/authMiddleware');
const premiumAuth = require('../middleware/premiumAuth');
const multer = require('multer');

// --- Multer setup for image uploads ---
const upload = multer({ storage: multer.memoryStorage() });

// --- Standard Route ---
router.post('/ask', auth, askAI);

// --- Interaction Checker Route ---
router.post('/check-interactions', auth, checkInteractions);

// --- NEW: OCR Route ---
router.post('/extract-from-image', auth, upload.single('medicineImage'), extractFromImage);

// --- NEW: Food Interaction Route ---
router.post('/check-food-interaction', auth, upload.single('foodImage'), checkFoodInteraction);

// --- Premium Route ---
router.post('/ask-enhanced', [auth, premiumAuth], askAIEnhanced);

module.exports = router;