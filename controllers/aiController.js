// controllers/aiController.js
const Regulation = require('../models/Regulation');
const Medication = require('../models/Medication');
const { getAIResponse, getInteractionResponse } = require('../services/aiService');

// @desc    Get a standard answer from the AI assistant
// @route   POST /api/ai/ask
// @access  Private
exports.askAI = async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ success: false, message: 'Question is required' });
    }

    try {
        const contextRegulations = await Regulation.find(
            { $text: { $search: question } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } }).limit(3);

        const context = contextRegulations.map(reg => `Title: ${reg.title}\nContent: ${reg.content}`).join('\n\n');

        // FIXED: Pass the raw question and context to the service
        const answer = await getAIResponse(question, context);

        res.status(200).json({ success: true, answer: answer });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Error getting response from AI service' });
    }
};

// @desc    Check for interactions between drugs/food/conditions
// @route   POST /api/ai/check-interactions
// @access  Private
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
        
        // FIXED: Pass raw data to an enhanced service function (or add it as a new param)
        // For simplicity, we create the enhanced prompt here, but pass it to a generic service function.
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

        // The getAIResponse function expects a pre-made prompt for this specific case
        const answer = await getAIResponse(enhancedPrompt); 

        res.status(200).json({ success: true, answer: answer });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Error getting response from AI service' });
    }
};