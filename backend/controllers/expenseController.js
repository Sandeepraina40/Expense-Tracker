/**
 * Expense Controller
 * Handles all CRUD operations for user expenses
 * Includes AI-powered financial insights via Google Gemini API

 */

const Expense = require('../models/Expense');
const {
  parseGeminiError,
  generateStructuredInsights,
  generateQuickTips,
  answerFinancialQuestion: askGemini,
} = require('../utils/geminiService');

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
    const expenses = await Expense.find({ user: req.user.id });

    if (!expenses?.length) {
      return res.status(200).json({
        structured: false,
        insights:
          "You haven't added any expenses yet. Start tracking your spending to receive personalized AI insights!",
      });
    }

    const result = await generateStructuredInsights(expenses);
    res.status(200).json(result);
  } catch (error) {
    console.error('AI Insights error:', error.message || error);
    const { status, message } = parseGeminiError(error);
    res.status(status).json({ message });
  }
};

const getQuickTips = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });

    if (!expenses?.length) {
      return res.status(200).json({
        tips: ['Add your first expense to unlock personalized AI tips.'],
      });
    }

    const tips = await generateQuickTips(expenses);
    res.status(200).json({ tips });
  } catch (error) {
    console.error('AI Quick tips error:', error.message || error);
    const { status, message } = parseGeminiError(error);
    res.status(status).json({ message });
  }
};

const askFinancialQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({ message: 'Please provide a question.' });
    }

    const expenses = await Expense.find({ user: req.user.id });

    if (!expenses?.length) {
      return res.status(200).json({
        answer:
          'You have no expenses recorded yet. Add transactions first, then I can answer questions about your spending.',
      });
    }

    const answer = await askGemini(expenses, question);
    res.status(200).json({ answer });
  } catch (error) {
    console.error('AI Ask error:', error.message || error);
    const { status, message } = parseGeminiError(error);
    res.status(status).json({ message });
  }
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseInsights,
  getQuickTips,
  askFinancialQuestion,
};
