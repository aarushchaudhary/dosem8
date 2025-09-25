// services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { searchAndScrapeGovSites } = require('./webSearchService'); // Make sure this is correctly imported

// Initialize the Google Generative AI client with the API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- NEW: Tool Definition for Web Search ---
const tools = {
  functionDeclarations: [
    {
      name: 'searchAndScrapeGovSites',
      description: 'Searches Indian government (.gov.in) websites for information about Indian pharmacy, drug, and medical regulations. Use this for any questions about rules, acts, schedules, or guidelines.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The specific question or topic to search for, e.g., "Schedule H drug dispensing rules" or "Pharmacy Act 1948".',
          },
        },
        required: ['query'],
      },
    },
  ],
};

const functionCallMapping = {
  searchAndScrapeGovSites: searchAndScrapeGovSites,
};

async function handleFunctionCall(functionCall) {
    const { name, args } = functionCall;
    const fn = functionCallMapping[name];
    if (!fn) {
        throw new Error(`Unknown function call: ${name}`);
    }
    const result = await fn(args.query);
    return {
        functionResponse: {
            name,
            response: { content: result },
        },
    };
}

// --- NEW: AI Function for Regulatory Questions (with Tools) ---
/**
 * Generates an answer for regulatory questions using the AI model, allowing it to use web search tools.
 * @param {string} question The user's question.
 * @returns {Promise<string>} The AI-generated answer.
 */
async function generateAnswerWithTools(question) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            tools: tools,
        });

        const chat = model.startChat();
        const prompt = `You are an expert on Indian pharmacy regulations. Please answer the following user question: "${question}"`;

        let result = await chat.sendMessage(prompt);
        let response = result.response;

        while (response.functionCalls && response.functionCalls.length > 0) {
            const toolResults = await Promise.all(
                response.functionCalls.map(handleFunctionCall)
            );
            result = await chat.sendMessage(JSON.stringify(toolResults));
            response = result.response;
        }

        return response.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error('Error in generateAnswerWithTools:', error);
        throw new Error('Could not get a response from the AI service.');
    }
}


// --- EXISTING: Function for Drug Interactions (Unchanged) ---
/**
 * Gets a brief drug interaction response from the AI.
 * @param {string} drugs A string containing a list of drugs, foods, or conditions.
 * @returns {Promise<string>} The AI-generated interaction analysis.
 */
async function getInteractionResponse(drugs) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
        throw new Error('Could not get a response from the AI service for interactions.');
    }
}

// --- LEGACY: Original AI Response function (kept for compatibility) ---
async function getAIResponse(question, context) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
        return response.text();
    } catch (error) {
        console.error('Error contacting AI service:', error);
        throw new Error('Could not get a response from the AI service.');
    }
}


module.exports = { 
    getAIResponse, 
    getInteractionResponse,
    generateAnswerWithTools // <-- Export the new function
};