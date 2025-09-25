// controllers/aiController.js
const Regulation = require('../models/Regulation'); // Re-import the Regulation model
const Medication = require('../models/Medication');
const { generateAnswerWithTools, getInteractionResponse, getAIResponse, getMedicineInfoFromImage, getFoodDrugInteractionFromImage } = require('../services/aiService');

// @desc    Get a standard answer from the AI assistant
// @route   POST /api/ai/ask
// @access  Private
exports.askAI = async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ success: false, message: 'Question is required' });
    }

    try {
        let answer;

        // --- NEW LOGIC ---
        // 1. First, check the local MongoDB 'regulations' collection
        const localRegulations = await Regulation.find(
            { $text: { $search: question } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } }).limit(5);

        // 2. If we find relevant regulations in our database, use them directly
        if (localRegulations && localRegulations.length > 0) {
            console.log('Found context in local database. Answering from DB.');
            const context = localRegulations.map(reg => `Title: ${reg.title}\nContent: ${reg.content}`).join('\n\n');
            
            // Use the simple getAIResponse for a direct answer based on the provided context
            answer = await getAIResponse(question, context);

        } else {
            // 3. If nothing is found locally, proceed with the tool-based web search
            console.log('No context in local database. Using tool-based web search.');
            answer = await generateAnswerWithTools(question);
        }

        res.status(200).json({ success: true, answer: answer });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Error getting response from AI service' });
    }
};

// @desc    Check for interactions between drugs/food/conditions
// @route   POST /api/ai/check-interactions
// @access  Private
// This function remains unchanged.
exports.checkInteractions = async (req, res) => {
    const { drugs } = req.body;

    if (!drugs) {
        return res.status(400).json({ success: false, message: 'A list of drugs is required' });
    }

    try {
        const answer = await getInteractionResponse(drugs);
        res.status(200).json({ success: true, answer: answer });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Error getting response from AI service' });
    }
};


// @desc    Get an enhanced, personalized answer from the AI assistant
// @route   POST /api/ai/ask-enhanced
// @access  Premium
// This function remains unchanged.
exports.askAIEnhanced = async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ success: false, message: 'Question is required' });
    }

    try {
        const contextRegulations = await Regulation.find(
            { $text: { $search: question } }
        ).sort({ score: { $meta: "textScore" } }).limit(3);
        const context = contextRegulations.map(reg => `Title: ${reg.title}\nContent: ${reg.content}`).join('\n\n');

        const userMedications = await Medication.find({ user: req.user.id });
        const medicationList = userMedications.length > 0
            ? userMedications.map(med => `- ${med.medicationName} (${med.dosage || 'N/A'})`).join('\n')
            : 'No medications listed.';
        
        const enhancedPrompt = `
            You are an expert assistant for Indian pharmacy regulations. A premium user is asking a question.
            Your role is to answer based ONLY on the provided regulatory context, but you MUST ALSO consider the user's current medication list for potential interactions or special considerations.

            **Provided Regulatory Context:**
            ---
            ${context || 'No specific context was found.'}
            ---

            **User's Current Medications:**
            ---
            ${medicationList}
            ---

            **User's Question:**
            "${question}"

            Based on the context and the user's medication list, please provide a detailed and cautious answer. If discussing any substance, mention if it might interact with the user's current medications. If no context is found, state that.
        `;
        
        const answer = await getAIResponse(enhancedPrompt); 

        res.status(200).json({ success: true, answer: answer });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Error getting response from AI service' });
    }
};

// @desc    Extract medicine info from an image using OCR and AI
// @route   POST /api/ai/extract-from-image
// @access  Private
exports.extractFromImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    try {
        const imageBuffer = req.file.buffer;
        const answer = await getMedicineInfoFromImage(imageBuffer);
        res.status(200).json({ success: true, answer: answer });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Error processing image' });
    }
};

// @desc    Check for interactions between a food item (from image) and a drug
// @route   POST /api/ai/check-food-interaction
// @access  Private
exports.checkFoodInteraction = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }
    const { drugName } = req.body;
    if (!drugName) {
        return res.status(400).json({ success: false, message: 'Drug name is required' });
    }

    try {
        const imageBuffer = req.file.buffer;
        const answer = await getFoodDrugInteractionFromImage(imageBuffer, drugName);
        res.status(200).json({ success: true, answer: answer });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Error processing image for food interaction' });
    }
};