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

        // The prompt is now correctly constructed here
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
        // FIXED: Throw the error so the controller can catch it
        throw new Error('Could not get a response from the AI service.');
    }
}

/**
 * Gets a brief drug interaction response from the AI
 * @param {string} drugs A string containing a list of drugs, foods, or conditions.
 * @returns {Promise<string>} The AI-generated interaction analysis.
 */
async function getInteractionResponse(drugs) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
            You are an expert pharmacological assistant. Analyze the following items for interactions and answer ONLY the three questions below.

            **Items to Analyze:**
            ---
            ${drugs}
            ---

            **1. Safety:** Is this combination safe or should it be avoided?
            **2. Potential Side Effects:** What are the key side effects?
            **3. Prevention:** How can the interaction be prevented or managed?

            Keep the entire response very brief and to the point.
            **Disclaimer:** This is for informational purposes only and not medical advice.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error('Error contacting AI service:', error);
        // FIXED: Throw the error so the controller can catch it
        throw new Error('Could not get a response from the AI service for interactions.');
    }
}

module.exports = { getAIResponse, getInteractionResponse };