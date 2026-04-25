require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function test() {
  console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
  console.log('API Key (first 10 chars):', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('GoogleGenAI initialized successfully');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Say hello in one sentence.'
    });
    
    console.log('Response text:', response.text);
    console.log('SUCCESS!');
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Status:', error.status);
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
  }
}

test();
