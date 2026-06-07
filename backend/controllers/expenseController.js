const Expense = require('../models/Expense');
const {
  parseGeminiError,
  generateStructuredInsights,
  generateQuickTips,
  answerFinancialQuestion: askGemini,
} = require('../utils/geminiService');

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error.message);
    res.status(500).json({ message: 'Server error while fetching expenses.' });
  }
};
const addExpense = async (req, res) => {
  try {
    const { amount, category, date, description } = req.body;
    if (!amount || !category || !description) {
      return res.status(400).json({
        message: 'Please provide all required fields: amount, category, and description.',
      });
    }
    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        message: 'Amount must be a valid positive number.',
      });
    }
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
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }
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
  deleteExpense,
  getExpenseInsights,
  getQuickTips,
  askFinancialQuestion,
};
