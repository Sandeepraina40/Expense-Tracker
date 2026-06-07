const express = require('express');
const router = express.Router();
const {
  getExpenses,
  addExpense,
  deleteExpense,
  getExpenseInsights,
  getQuickTips,
  askFinancialQuestion,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.get('/insights/quick', protect, getQuickTips);
router.get('/insights', protect, getExpenseInsights);
router.post('/ai/ask', protect, askFinancialQuestion);
router.route('/').get(protect, getExpenses).post(protect, addExpense);
router.route('/:id').delete(protect, deleteExpense);

module.exports = router;
