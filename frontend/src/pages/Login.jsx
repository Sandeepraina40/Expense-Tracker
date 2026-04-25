/**
 * Login Page Component
 * Handles user authentication with email and password
 * Features glassmorphic UI design with smooth animations
 * @author Harsh Chimnani
 */
import { useState, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LogIn, Activity, Mail, Lock } from 'lucide-react';

const Login = () => {
  // Form field states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auth context and navigation hooks
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle form submission and authentication
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }, [email, password, login, navigate]);

  return (
    <div className="relative flex h-screen min-h-screen items-center justify-center overflow-hidden bg-[#020617]">
      {/* Animated Background Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] h-96 w-96 rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen animate-pulse-slow font-delay-2000"></div>
      <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] h-72 w-72 rounded-full bg-indigo-600/10 blur-[100px] mix-blend-screen"></div>

      <div className="relative z-10 w-full max-w-md px-6 animate-slide-up">
        {/* Brand Header Section */}
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30 mb-6">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-400 font-medium text-sm">
            Sign in to continue managing your expenses.
          </p>
        </div>

        {/* Login Form Card with Glassmorphic Styling */}
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

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email Input Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3.5 text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-800/80 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3.5 text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-800/80 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Submit Button with Loading State */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-4 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Navigation Link to Register Page */}
          <div className="mt-8 text-center text-sm">
            <span className="text-slate-400">Don't have an account? </span>
            <Link
              to="/register"
              className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
            >
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
