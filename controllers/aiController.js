// controllers/aiController.js
const Regulation = require('../models/Regulation');
const { getAIResponse } = require('../services/aiService'); // Assuming this function exists in aiService.js

// @desc    Get an answer from the AI assistant
// @route   POST /api/ai/ask
exports.askAI = async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ success: false, message: 'Question is required' });
    }

    try {
        // Step 1: Find relevant regulations from your database to provide context.
        // This is a simple text search; it can be made more advanced.
        const contextRegulations = await Regulation.find(
            { $text: { $search: question } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } }).limit(3);

        const context = contextRegulations.map(reg => `Title: ${reg.title}\nContent: ${reg.content}`).join('\n\n');

        // Step 2: Call your AI service with the question and the context.
        const answer = await getAIResponse(question, context);

        res.status(200).json({ success: true, answer: answer });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Error getting response from AI service' });
    }
};

// Note: To make the text search work on the Regulation model,
// you need to add a text index in your Regulation.js schema like this:
// regulationSchema.index({ title: 'text', content: 'text' });