/**
 * ExpenseList Component
 * Displays a scrollable list of expense transactions
 * Supports deletion with confirmation dialog
 * @author Harsh Chimnani
 */
import { useCallback } from 'react';
import { Trash2, Receipt } from 'lucide-react';
import axios from 'axios';

// API base URL from environment configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Category color mapping for visual distinction
const CATEGORY_STYLES = {
  'Food': 'bg-orange-500/20 text-orange-400 border-orange-500/20',
  'Transport': 'bg-blue-500/20 text-blue-400 border-blue-500/20',
  'Education': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
  'Entertainment': 'bg-pink-500/20 text-pink-400 border-pink-500/20',
  'Shopping': 'bg-purple-500/20 text-purple-400 border-purple-500/20',
  'Other': 'bg-slate-500/20 text-slate-300 border-slate-500/20',
};

// Default style for unknown categories
const DEFAULT_CATEGORY_STYLE = CATEGORY_STYLES['Other'];

/**
 * Formats a date string into a display-friendly format
 * @param {string} dateStr - ISO date string
 * @returns {object} Formatted day and month
 */
const formatExpenseDate = (dateStr) => {
  const date = new Date(dateStr);
  return {
    day: date.getDate(),
    month: date.toLocaleString('default', { month: 'short' }),
    full: date.toLocaleDateString(),
  };
};

const ExpenseList = ({ expenses, onDeleteExpense }) => {
  // Handle expense deletion with user confirmation
  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this expense? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await axios.delete(`${API_BASE_URL}/expenses/${id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      onDeleteExpense(id);
    } catch (error) {
      console.error('Failed to delete expense:', error.message);
      alert('Could not delete expense. Please try again.');
    }
  }, [onDeleteExpense]);

  // Empty state display when no expenses exist
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="h-24 w-24 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-white/5">
          <Receipt className="h-10 w-10 text-slate-500" />
        </div>
        <p className="text-slate-400 font-medium">No expenses found.</p>
        <p className="text-sm text-slate-500 mt-1">
          Add your first expense to see it here.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2"
      style={{ scrollbarWidth: 'thin' }}
      role="list"
      aria-label="Expense transactions"
    >
      {expenses.map((expense) => {
        const categoryStyle = CATEGORY_STYLES[expense.category] || DEFAULT_CATEGORY_STYLE;
        const dateInfo = formatExpenseDate(expense.date);

        return (
          <div
            key={expense._id}
            className="group flex items-center justify-between p-4 rounded-2xl bg-slate-900/40 border border-white/5 hover:bg-slate-800/60 hover:border-white/10 transition-all duration-300"
            role="listitem"
          >
            {/* Left Section: Date Badge + Expense Details */}
            <div className="flex items-center gap-4">
              {/* Date Badge - Hidden on small screens */}
              <div className="hidden sm:flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-slate-950/50 border border-white/5 text-slate-300 text-xs font-bold">
                <span>{dateInfo.day}</span>
                <span className="text-[10px] uppercase text-slate-500 tracking-wider">
                  {dateInfo.month}
                </span>
              </div>

              {/* Expense Description & Category */}
              <div>
                <h4 className="font-semibold text-white group-hover:text-blue-200 transition-colors">
                  {expense.description}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${categoryStyle}`}>
                    {expense.category}
                  </span>
                  {/* Mobile-only date display */}
                  <span className="text-xs text-slate-500 sm:hidden">
                    {dateInfo.full}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section: Amount & Delete Action */}
            <div className="flex items-center gap-4">
              <span className="font-extrabold text-white text-lg">
                ${expense.amount.toFixed(2)}
              </span>
              <button
                onClick={() => handleDelete(expense._id)}
                className="p-2 rounded-xl bg-slate-950/50 text-slate-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-white/5 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 focus:opacity-100"
                title="Delete this expense"
                aria-label={`Delete expense: ${expense.description}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExpenseList;
