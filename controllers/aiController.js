// controllers/aiController.js
const Regulation = require('../models/Regulation');
const Medication = require('../models/Medication'); // <-- NEW: Import Medication model
const { getAIResponse } = require('../services/aiService');

// @desc    Get a standard answer from the AI assistant
// @route   POST /api/ai/ask
// @access  Private (for all logged-in users)
exports.askAI = async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ success: false, message: 'Question is required' });
    }

    try {
        // Step 1: Find relevant regulations from your database to provide context.
        const contextRegulations = await Regulation.find(
            { $text: { $search: question } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } }).limit(3);

        const context = contextRegulations.map(reg => `Title: ${reg.title}\nContent: ${reg.content}`).join('\n\n');

        // Step 2: Call your AI service with a standard prompt.
        const standardPrompt = `
            You are an expert assistant for Indian pharmacy regulations.
            Based ONLY on the provided regulatory context, please answer the user's question.

            **Provided Context:**
            ---
            ${context || 'No specific context was found.'}
            ---

            **User's Question:**
            "${question}"
        `;
        const answer = await getAIResponse(standardPrompt);

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
        // Step 1: Find relevant regulations (same as before)
        const contextRegulations = await Regulation.find(
            { $text: { $search: question } }
        ).sort({ score: { $meta: "textScore" } }).limit(3);
        const context = contextRegulations.map(reg => `Title: ${reg.title}\nContent: ${reg.content}`).join('\n\n');

        // Step 2 (Premium Logic): Fetch the user's current medications
        const userMedications = await Medication.find({ user: req.user.id });
        const medicationList = userMedications.length > 0
            ? userMedications.map(med => `- ${med.medicationName} (${med.dosage || 'N/A'})`).join('\n')
            : 'No medications listed.';

        // Step 3: Call the AI service with an enhanced prompt including the user's medication list
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