require('dotenv').config({ override: true });
const { getModel, generateText, parseGeminiError } = require('./utils/geminiService');

async function test() {
  console.log('Model:', getModel());
  console.log('API Key configured:', !!process.env.GEMINI_API_KEY);

  try {
    const text = await generateText('Reply with exactly: Gemini is working.');
    console.log('Response:', text);
    console.log('SUCCESS — AI is configured correctly.');
  } catch (error) {
    const { status, message } = parseGeminiError(error);
    console.error('FAILED (HTTP', status + '):', message);
    if (message.toLowerCase().includes('api key')) {
      console.error('\n→ Get a new key: https://aistudio.google.com/apikey');
      console.error('→ Add to backend/.env: GEMINI_API_KEY=your_key_here');
      console.error('→ Restart the backend server.');
    }
    process.exit(1);
  }
}

test();
