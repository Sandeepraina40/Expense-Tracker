
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
import AIAssistant from '../components/AIAssistant';
import { API_BASE_URL } from '../config/api';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return { Authorization: `Bearer ${userInfo?.token}` };
  }, []);

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

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleExpenseAdded = useCallback((newExpense) => {
    setExpenses((prev) => {
      const updated = [newExpense, ...prev];
      return updated.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
  }, []);

  const handleDeleteExpense = useCallback((id) => {
    setExpenses((prev) => prev.filter((expense) => expense._id !== id));
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesCategory = filterCategory === 'All' || expense.category === filterCategory;

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

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const expenseCount = filteredExpenses.length;

  return (
    <div className="min-h-screen bg-[#020617] pb-12 overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-15%] left-[30%] h-[400px] w-[400px] rounded-full bg-indigo-600/8 blur-[100px] mix-blend-screen pointer-events-none"></div>

      <nav className="glass border-b border-white/5 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl p-2 shadow-lg shadow-blue-500/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Expense<span className="text-blue-400">Tracker</span>
            </span>
          </div>

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

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8 relative z-10 animate-fade-in">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-10 shadow-2xl shadow-blue-500/20">
          <div className="absolute top-0 right-0 p-12 opacity-10 blur-xl mix-blend-overlay pointer-events-none">
            <div className="h-32 w-32 rounded-full bg-white"></div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
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

            <button
              onClick={() => setShowAIAssistant(true)}
              className="relative z-10 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl border border-white/20 font-medium transition-all shadow-lg backdrop-blur-md"
              aria-label="Open AI Financial Assistant"
            >
              <Sparkles className="h-5 w-5 text-yellow-300" />
              AI Assistant
            </button>
          </div>
        </div>

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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 space-y-6">
            <ExpenseForm onExpenseAdded={handleExpenseAdded} />
            <ExpenseFilter
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </div>

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

        {showAIAssistant && (
          <AIAssistant
            getAuthHeaders={getAuthHeaders}
            expenseCount={expenses.length}
            onClose={() => setShowAIAssistant(false)}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
