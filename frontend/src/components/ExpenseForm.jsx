/**
 * ExpenseForm Component
 * Form for adding new expense entries with category selection
 * Supports amount, category, date, and description fields
 * @author Harsh Chimnani
 */
import { useState, useCallback } from 'react';
import axios from 'axios';
import { Plus, DollarSign, Tag, Calendar, FileText } from 'lucide-react';

// Available expense categories for classification
const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Education',
  'Entertainment',
  'Shopping',
  'Other',
];

// API base URL from environment configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

const ExpenseForm = ({ onExpenseAdded }) => {
  // Form field states with sensible defaults
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form fields after successful submission
  const resetForm = useCallback(() => {
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setError('');
  }, []);

  // Handle form submission - create a new expense entry
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!amount || !category || !description) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validate amount is a positive number
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));

      const expenseData = {
        amount: numericAmount,
        category,
        description: description.trim(),
        date,
      };

      const { data } = await axios.post(
        `${API_BASE_URL}/expenses`,
        expenseData,
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      // Notify parent component and reset form
      onExpenseAdded(data);
      resetForm();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save expense. Please try again.';
      setError(errorMessage);
      console.error('Expense creation error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [amount, category, description, date, onExpenseAdded, resetForm]);

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Plus className="h-5 w-5 text-blue-400" />
        Add Expense
      </h3>

      {/* Error Display */}
      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 p-3 border border-red-500/20 text-sm text-red-400 animate-fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 flex flex-col">
        {/* Amount Input */}
        <div className="space-y-1.5">
          <label htmlFor="expense-amount" className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
            Amount ($)
          </label>
          <input
            id="expense-amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3 text-white focus:border-blue-500 focus:bg-slate-900/80 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none leading-none h-[50px] m-0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-1.5">
          <label htmlFor="expense-category" className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            Category
          </label>
          <select
            id="expense-category"
            required
            className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3 text-white focus:border-blue-500 focus:bg-slate-900/80 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none leading-none h-[50px] m-0"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ colorScheme: 'dark' }}
          >
            <option value="" disabled>Select Category</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
            ))}
          </select>
        </div>

        {/* Date Picker */}
        <div className="space-y-1.5">
          <label htmlFor="expense-date" className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            Date
          </label>
          <input
            id="expense-date"
            type="date"
            required
            className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3 text-white focus:border-blue-500 focus:bg-slate-900/80 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none leading-none h-[50px] m-0"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Description Input */}
        <div className="space-y-1.5">
          <label htmlFor="expense-description" className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            Description
          </label>
          <input
            id="expense-description"
            type="text"
            required
            maxLength={100}
            className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3 text-white focus:border-blue-500 focus:bg-slate-900/80 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none leading-none h-[50px] m-0"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this for?"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex justify-center items-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 h-[50px] text-sm font-bold text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 disabled:opacity-50 disabled:scale-100"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Saving...
            </span>
          ) : (
            <>
              Save Expense
              <Plus className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
