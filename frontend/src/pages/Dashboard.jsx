/**
 * Dashboard Page - Main application view
 * Displays expense overview, data visualizations, and AI insights
 * Integrated with Gemini AI for financial analysis
 * @author Harsh Chimnani
 */
import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseFilter from '../components/ExpenseFilter';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import MonthlyBarChart from '../components/charts/MonthlyBarChart';
import WeeklyLineChart from '../components/charts/WeeklyLineChart';
import { LogOut, Activity, Sparkles, TrendingUp, Wallet } from 'lucide-react';

// API base URL from environment configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  // Core expense data state
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state management
  const [filterCategory, setFilterCategory] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // AI Insights state
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  // Helper to get authorization headers from localStorage
  const getAuthHeaders = useCallback(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return { Authorization: `Bearer ${userInfo?.token}` };
  }, []);

  // Fetch all user expenses from the backend API
  const fetchExpenses = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/expenses`, {
        headers: getAuthHeaders(),
      });
      setExpenses(data);
    } catch (error) {
      console.error('Failed to load expenses:', error.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Load expenses on component mount
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Fetch AI-powered financial insights from Gemini API
  const fetchInsights = useCallback(async () => {
    setInsightsLoading(true);
    setShowInsightsModal(true);
    setInsights(null);

    try {
      const { data } = await axios.get(`${API_BASE_URL}/expenses/insights`, {
        headers: getAuthHeaders(),
      });
      setInsights(data.insights);
    } catch (error) {
      console.error('AI Insights fetch error:', error.message);
      const errorMsg = error.response?.data?.message || 'Failed to generate insights. Please try again later.';
      setInsights(errorMsg);
    } finally {
      setInsightsLoading(false);
    }
  }, [getAuthHeaders]);

  // Handler for when a new expense is added via the form
  const handleExpenseAdded = useCallback((newExpense) => {
    setExpenses(prevExpenses => {
      const updated = [newExpense, ...prevExpenses];
      return updated.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
  }, []);

  // Handler for expense deletion
  const handleDeleteExpense = useCallback((id) => {
    setExpenses(prevExpenses => prevExpenses.filter((expense) => expense._id !== id));
  }, []);

  // Apply category and date range filters to expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Category filter check
      const matchesCategory = filterCategory === 'All' || expense.category === filterCategory;

      // Date range filter check
      let matchesDate = true;
      const expenseDate = new Date(expense.date);

      if (dateRange.start) {
        matchesDate = matchesDate && expenseDate >= new Date(dateRange.start);
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setDate(endDate.getDate() + 1);
        matchesDate = matchesDate && expenseDate < endDate;
      }

      return matchesCategory && matchesDate;
    });
  }, [expenses, filterCategory, dateRange]);

  // Calculate total amount from filtered expenses
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  // Calculate expense count for display
  const expenseCount = filteredExpenses.length;

  // Close insights modal handler
  const closeInsightsModal = useCallback(() => {
    setShowInsightsModal(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] pb-12 overflow-hidden relative">
      {/* Ambient Background Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-15%] left-[30%] h-[400px] w-[400px] rounded-full bg-indigo-600/8 blur-[100px] mix-blend-screen pointer-events-none"></div>

      {/* Top Navigation Bar */}
      <nav className="glass border-b border-white/5 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl p-2 shadow-lg shadow-blue-500/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Expense<span className="text-blue-400">Tracker</span>
            </span>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-6">
            <span className="text-slate-300 text-sm hidden sm:block">
              Welcome back, <span className="font-semibold text-white">{user?.name}</span>
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-white transition-all duration-300"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8 relative z-10 animate-fade-in">

        {/* Financial Summary Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-10 shadow-2xl shadow-blue-500/20">
          {/* Decorative blur element */}
          <div className="absolute top-0 right-0 p-12 opacity-10 blur-xl mix-blend-overlay pointer-events-none">
            <div className="h-32 w-32 rounded-full bg-white"></div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            {/* Total & Stats Section */}
            <div className="relative z-10">
              <h2 className="text-blue-100 font-medium mb-2 text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Total Filtered Expenses
              </h2>
              <div className="text-5xl font-extrabold text-white tracking-tight">
                ${totalExpenses.toFixed(2)}
              </div>
              <p className="text-blue-200/70 text-sm mt-2 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                {expenseCount} transaction{expenseCount !== 1 ? 's' : ''} recorded
              </p>
            </div>

            {/* AI Insights Action Button */}
            <button
              onClick={fetchInsights}
              disabled={insightsLoading}
              className="relative z-10 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl border border-white/20 font-medium transition-all shadow-lg backdrop-blur-md disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Generate AI Financial Insights"
            >
              <Sparkles className="h-5 w-5 text-yellow-300" />
              Get AI Insights
            </button>
          </div>
        </div>

        {/* Data Visualization Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-6" aria-label="Category Distribution Chart">
            <CategoryPieChart expenses={filteredExpenses} />
          </div>
          <div className="glass-card rounded-3xl p-6" aria-label="Monthly Expenses Chart">
            <MonthlyBarChart expenses={filteredExpenses} />
          </div>
          <div className="glass-card rounded-3xl p-6" aria-label="Daily Spending Trend Chart">
            <WeeklyLineChart expenses={filteredExpenses} />
          </div>
        </div>

        {/* Expense Management Section - Form, Filters & Transaction List */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column: Add Expense Form & Filters */}
          <div className="xl:col-span-1 space-y-6">
            <ExpenseForm onExpenseAdded={handleExpenseAdded} />
            <ExpenseFilter
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </div>

          {/* Right Column: Transaction History */}
          <div className="xl:col-span-2 glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
              <span className="text-sm text-slate-400">{expenseCount} items</span>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <ExpenseList expenses={filteredExpenses} onDeleteExpense={handleDeleteExpense} />
            )}
          </div>
        </div>

        {/* AI Insights Modal Overlay */}
        {showInsightsModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="AI Financial Insights"
          >
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative">
              {/* Close Button */}
              <button
                onClick={closeInsightsModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                aria-label="Close insights modal"
              >
                ✕
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">AI Financial Insights</h3>
                  <p className="text-sm text-slate-400">Powered by Google Gemini</p>
                </div>
              </div>

              {/* Modal Content - Insights or Loading State */}
              <div className="text-slate-300 min-h-[150px] max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {insightsLoading ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                    <p className="animate-pulse text-purple-300">Analyzing your expenses with Gemini AI...</p>
                  </div>
                ) : (
                  <div className="space-y-4 whitespace-pre-wrap leading-relaxed">
                    {insights}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
