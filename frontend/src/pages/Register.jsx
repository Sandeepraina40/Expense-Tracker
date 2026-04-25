/**
 * Register Page Component
 * Handles new user registration with form validation
 * Features glassmorphic design consistent with login page
 * @author Harsh Chimnani
 */
import { useState, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { UserPlus, Activity, User, Mail, Lock, ShieldCheck } from 'lucide-react';

const Register = () => {
  // Form field states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auth context and navigation hooks
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Validate form inputs before submission
  const validateForm = useCallback(() => {
    if (!name.trim()) {
      return 'Please enter your full name.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match. Please try again.';
    }
    return null;
  }, [name, password, confirmPassword]);

  // Handle registration form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    // Run client-side validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await register(name.trim(), email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred during registration.');
      setLoading(false);
    }
  }, [name, email, password, validateForm, register, navigate]);

  return (
    <div className="relative flex h-screen min-h-screen items-center justify-center overflow-hidden bg-[#020617]">
      {/* Animated Background Gradient Orbs */}
      <div className="absolute top-[-10%] right-[-10%] h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] h-96 w-96 rounded-full bg-pink-600/20 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
      <div className="absolute top-[30%] left-[20%] h-64 w-64 rounded-full bg-violet-600/10 blur-[100px] mix-blend-screen"></div>

      <div className="relative z-10 w-full max-w-md px-6 animate-slide-up">
        {/* Brand Header Section */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 shadow-lg shadow-indigo-500/30 mb-6">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Join ExpenseTracker
          </h1>
          <p className="text-slate-400 font-medium text-sm">
            Create your account and start managing your finances.
          </p>
        </div>

        {/* Registration Form Card with Glassmorphic Styling */}
        <div className="glass rounded-3xl p-8 sm:p-10">
          {/* Error Alert Display */}
          {error && (
            <div
              className="mb-6 rounded-xl bg-red-500/10 p-4 border border-red-500/20 text-sm text-red-400 flex items-center gap-3 animate-fade-in"
              role="alert"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="register-name" className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                required
                autoComplete="name"
                className="w-full rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="register-email" className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="register-password" className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                Password
              </label>
              <input
                id="register-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-slate-500 ml-1">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="register-confirm-password" className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Submit Button with Loading State */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-600 px-4 py-4 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating account...
                </span>
              ) : (
                <>
                  Create Account
                  <UserPlus className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Navigation Link to Login Page */}
          <div className="mt-8 text-center text-sm">
            <span className="text-slate-400">Already registered? </span>
            <Link
              to="/login"
              className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Sign in securely
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
