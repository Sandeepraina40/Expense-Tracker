const { GoogleGenAI } = require('@google/genai');

const DEFAULT_MODEL = 'gemini-2.5-flash';

function getModel() {
  return process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

function getApiKey() {
  const raw = process.env.GEMINI_API_KEY;
  if (!raw) return undefined;
  return raw.trim().replace(/^['"]|['"]$/g, '');
}

function getModelCandidates() {
  const preferred = getModel();
  return [...new Set([preferred, 'gemini-2.0-flash', 'gemini-1.5-flash'])];
}

function createClient() {
  const apiKey = getApiKey();
  if (!apiKey) {
    const err = new Error(
      'AI is not configured. Add GEMINI_API_KEY to backend/.env (get a key at https://aistudio.google.com/apikey).'
    );
    err.code = 'AI_NOT_CONFIGURED';
    throw err;
  }
  return new GoogleGenAI({ apiKey });
}

function parseGeminiError(error) {
  const raw = error?.message || '';
  let detail = raw;

  try {
    const parsed = JSON.parse(raw);
    detail = parsed?.error?.message || raw;
  } catch {
    // message may already be plain text
  }

  const lower = detail.toLowerCase();

  if (lower.includes('api key expired') || lower.includes('api_key_invalid')) {
    return {
      status: 503,
      message:
        'Your Gemini API key is invalid or expired. Create a new key at https://aistudio.google.com/apikey and set GEMINI_API_KEY in backend/.env, then restart the server.',
    };
  }

  if (
    lower.includes('high demand') ||
    lower.includes('overloaded') ||
    lower.includes('try again later')
  ) {
    return {
      status: 503,
      message: 'Gemini is busy right now. Wait 30–60 seconds and try again.',
    };
  }

  if (error?.status === 429 || lower.includes('rate limit') || lower.includes('quota')) {
    return {
      status: 429,
      message: 'AI rate limit reached. Please wait a minute and try again.',
    };
  }

  if (lower.includes('not found') && lower.includes('model')) {
    return {
      status: 503,
      message: `AI model unavailable. Try setting GEMINI_MODEL=gemini-2.5-flash in backend/.env.`,
    };
  }

  return {
    status: error?.status && error.status >= 400 && error.status < 600 ? error.status : 500,
    message: detail || 'Failed to reach the AI service. Please try again.',
  };
}

function isRetryableModelError(error) {
  const { message } = parseGeminiError(error);
  const lower = message.toLowerCase();
  return (
    error?.status === 429 ||
    error?.status === 503 ||
    lower.includes('rate limit') ||
    lower.includes('high demand') ||
    lower.includes('busy') ||
    lower.includes('quota')
  );
}

async function generateText(prompt, config = {}) {
  const ai = createClient();
  const models = getModelCandidates();
  let lastError;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        ...config,
      });

      const text = response?.text?.trim();
      if (!text) {
        const err = new Error('AI returned an empty response. Please try again.');
        err.code = 'AI_EMPTY_RESPONSE';
        throw err;
      }

      return text;
    } catch (error) {
      lastError = error;
      const { message } = parseGeminiError(error);
      const lower = message.toLowerCase();

      if (lower.includes('api key') || lower.includes('invalid') || lower.includes('expired')) {
        throw error;
      }

      if (isRetryableModelError(error) && model !== models[models.length - 1]) {
        console.warn(`Gemini model ${model} unavailable, trying fallback…`);
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('AI request failed.');
}

function parseJsonFromText(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function buildExpenseReport(expenses) {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryBreakdown = {};

  expenses.forEach((expense) => {
    categoryBreakdown[expense.category] =
      (categoryBreakdown[expense.category] || 0) + expense.amount;
  });

  const categoryReport = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2)),
      percent: totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(1)) : 0,
    }));

  const sortedByDate = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = sortedByDate.slice(0, 8).map((exp) => ({
    date: new Date(exp.date).toISOString().split('T')[0],
    category: exp.category,
    amount: exp.amount,
    description: exp.description,
  }));

  const now = new Date();
  const thisMonth = expenses.filter((exp) => {
    const d = new Date(exp.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = expenses.filter((exp) => {
    const d = new Date(exp.date);
    const m = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
  });

  const monthTotal = (list) => list.reduce((s, e) => s + e.amount, 0);

  const avgPerTransaction = expenses.length > 0 ? totalAmount / expenses.length : 0;
  const highest = sortedByDate.reduce(
    (max, exp) => (exp.amount > (max?.amount || 0) ? exp : max),
    null
  );

  return {
    totalAmount: Number(totalAmount.toFixed(2)),
    transactionCount: expenses.length,
    categoryReport,
    recentTransactions: recent,
    thisMonthTotal: Number(monthTotal(thisMonth).toFixed(2)),
    lastMonthTotal: Number(monthTotal(lastMonth).toFixed(2)),
    avgPerTransaction: Number(avgPerTransaction.toFixed(2)),
    highestExpense: highest
      ? {
          amount: highest.amount,
          category: highest.category,
          description: highest.description,
          date: new Date(highest.date).toISOString().split('T')[0],
        }
      : null,
  };
}

async function generateStructuredInsights(expenses) {
  const report = buildExpenseReport(expenses);

  const prompt = `You are a helpful personal finance coach for an expense tracker app user.

Spending data (JSON):
${JSON.stringify(report, null, 2)}

Analyze their habits and respond with ONLY valid JSON (no markdown) using this exact shape:
{
  "summary": "2-3 sentence overview",
  "healthScore": <integer 1-10, 10 is excellent control>,
  "topInsight": "single most important observation",
  "patterns": ["pattern 1", "pattern 2", "pattern 3"],
  "savingsTips": ["actionable tip 1", "actionable tip 2", "actionable tip 3"],
  "budgetAdvice": "one paragraph on a realistic monthly budget based on their data",
  "monthComparison": "compare this month vs last month if data exists, else say insufficient history",
  "encouragement": "short motivating closing line"
}`;

  const text = await generateText(prompt);
  const parsed = parseJsonFromText(text);

  if (parsed?.summary) {
    return { structured: true, ...parsed, report };
  }

  return {
    structured: false,
    insights: text,
    report,
  };
}

async function generateQuickTips(expenses) {
  const report = buildExpenseReport(expenses);

  const prompt = `Based on this expense data JSON, give exactly 5 short bullet tips (one line each) to save money and track spending better. No intro or outro.

Data:
${JSON.stringify(report, null, 2)}

Format: return ONLY a JSON array of 5 strings, e.g. ["tip1","tip2",...]`;

  const text = await generateText(prompt);
  const tips = parseJsonFromText(text);

  if (Array.isArray(tips) && tips.length > 0) {
    return tips.slice(0, 5);
  }

  return text
    .split('\n')
    .map((line) => line.replace(/^[-*•\d.]+\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 5);
}

async function answerFinancialQuestion(expenses, question) {
  const report = buildExpenseReport(expenses);

  const prompt = `You are a personal finance assistant inside an expense tracker app. Answer the user's question using ONLY their data below. Be concise (under 200 words), practical, and friendly. If the data cannot answer the question, say what is missing and suggest what to track.

User question: ${question.trim()}

Expense data (JSON):
${JSON.stringify(report, null, 2)}`;

  return generateText(prompt);
}

module.exports = {
  getModel,
  getApiKey,
  parseGeminiError,
  buildExpenseReport,
  generateStructuredInsights,
  generateQuickTips,
  answerFinancialQuestion,
  generateText,
};
