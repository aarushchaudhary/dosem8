// services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Google Generative AI client with the API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Gets a response from the AI based on a question and context.
 * @param {string} question The user's question.
 * @param {string} context The relevant regulatory text from the database.
 * @returns {Promise<string>} The AI-generated answer.
 */
async function getAIResponse(question, context) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Crafting a detailed prompt for better, safer responses.
        const prompt = `
            You are an expert assistant for Indian pharmacy regulations. Your role is to answer questions based ONLY on the provided regulatory context. Do not use external knowledge.

            **Provided Context:**
            ---
            ${context || 'No specific context was found.'}
            ---

            **User's Question:**
            "${question}"

            Based on the provided context, please answer the user's question. If the context does not contain the answer, state that you cannot answer based on the information provided.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error('Error contacting AI service:', error);
        return 'Sorry, I am unable to process your request at the moment.';
    }
}

module.exports = { getAIResponse };