/**
 * Expense Controller
 * Handles all CRUD operations for user expenses
 * Includes AI-powered financial insights via Google Gemini API
 * @author Harsh Chimnani
 */

const Expense = require('../models/Expense');
const { GoogleGenAI } = require('@google/genai');

// ============================================================
// @desc    Get all expenses for the authenticated user
// @route   GET /api/expenses
// @access  Private
// ============================================================
const getExpenses = async (req, res) => {
  try {
    // Fetch expenses sorted by date (newest first)
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error.message);
    res.status(500).json({ message: 'Server error while fetching expenses.' });
  }
};

// ============================================================
// @desc    Add a new expense entry
// @route   POST /api/expenses
// @access  Private
// ============================================================
const addExpense = async (req, res) => {
  try {
    const { amount, category, date, description } = req.body;

    // Validate required fields
    if (!amount || !category || !description) {
      return res.status(400).json({
        message: 'Please provide all required fields: amount, category, and description.',
      });
    }

    // Validate amount is a positive number
    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        message: 'Amount must be a valid positive number.',
      });
    }

    // Create the expense document in MongoDB
    const expense = await Expense.create({
      amount: Number(amount),
      category,
      date: date || Date.now(),
      description: description.trim(),
      user: req.user.id,
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error adding expense:', error.message);
    res.status(500).json({ message: 'Server error while adding expense.' });
  }
};

// ============================================================
// @desc    Update an existing expense
// @route   PUT /api/expenses/:id
// @access  Private
// ============================================================
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    // Authorization check: ensure the expense belongs to the current user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this expense.' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error.message);
    res.status(500).json({ message: 'Server error while updating expense.' });
  }
};

// ============================================================
// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
// ============================================================
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    // Authorization check: ensure the expense belongs to the current user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this expense.' });
    }

    await expense.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Expense deleted successfully.' });
  } catch (error) {
    console.error('Error deleting expense:', error.message);
    res.status(500).json({ message: 'Server error while deleting expense.' });
  }
};

// ============================================================
// @desc    Get AI-powered financial insights using Gemini API
// @route   GET /api/expenses/insights
// @access  Private
// ============================================================
const getExpenseInsights = async (req, res) => {
  try {
    // Verify Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      return res.status(500).json({
        message: 'AI service is not configured. Please contact the administrator.',
      });
    }

    // Fetch all expenses for the current user
    const expenses = await Expense.find({ user: req.user.id });

    if (!expenses || expenses.length === 0) {
      return res.status(200).json({
        insights: "You haven't added any expenses yet. Start tracking your spending to receive personalized AI-powered financial insights!",
      });
    }

    // Calculate total spending amount
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Aggregate spending by category for detailed breakdown
    const categoryBreakdown = {};
    expenses.forEach((expense) => {
      const { category, amount } = expense;
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + amount;
    });

    // Format category data for the AI prompt
    const categoryReport = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a) // Sort by amount descending
      .map(([category, amount]) => `- ${category}: $${amount.toFixed(2)}`)
      .join('\n');

    // Construct the AI analysis prompt
    const analysisPrompt = `I am a user of an expense tracker app. I need some short, helpful financial insights based on my spending.

My total expenses are $${totalAmount.toFixed(2)} across ${expenses.length} transactions.

Here is the breakdown by category (sorted by highest spend):
${categoryReport}

Please provide a 2-3 paragraph brief analysis of my spending habits, identify areas where I could save money, and close with an encouraging statement. Keep it concise, friendly, and helpful.`;

    // Initialize Gemini AI client and generate content
    console.log('Generating AI insights for user:', req.user.id);
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: analysisPrompt,
    });

    // Extract and validate the response text
    const insightText = response.text;
    if (!insightText) {
      console.error('Gemini API returned empty response for user:', req.user.id);
      return res.status(500).json({
        message: 'AI returned an empty response. Please try again later.',
      });
    }

    console.log('AI insights generated successfully for user:', req.user.id);
    res.status(200).json({ insights: insightText });
  } catch (error) {
    console.error('AI Insights error:', error.message || error);
    const statusCode = error.status === 429 ? 429 : 500;
    const errorMessage = error.status === 429
      ? 'AI service rate limit reached. Please wait a moment and try again.'
      : `Failed to generate AI insights: ${error.message || 'Unknown error'}`;

    res.status(statusCode).json({ message: errorMessage });
  }
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseInsights,
};
