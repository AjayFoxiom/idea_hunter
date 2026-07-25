const { GoogleGenAI } = require('@google/genai');
const geminiApiKey = process.env.GEMINI_API_KEY;
const { buildHarvestPrompt } = require('../../constants/sources');
const parseJsonSafe = require('../../utils/parseJsonSafe');

const ai = new GoogleGenAI({ apiKey: geminiApiKey });

async function harvestIdeas(date) {
  const prompt = buildHarvestPrompt(date);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        tools: [{ googleSearch: {} }]
      },
    });

    return parseJsonSafe(response.text.trim());
  } catch (error) {
    if (error.message && error.message.includes('429')) {
      throw new Error('Gemini API quota exceeded. Please check your Google AI Studio plan and billing details, or try again later.');
    }
    throw error;
  }
}

module.exports = { harvestIdeas };