/**
 * AuthContext - Authentication Context Provider
 * Manages user authentication state across the application
 * Provides login, register, and logout functionality
 * @author Harsh Chimnani
 */
import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

// API base URL from environment configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Local storage key for persisting user session
const USER_STORAGE_KEY = 'userInfo';

// Create the authentication context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wraps the app to provide authentication state and actions
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user session from local storage on initial mount
  useEffect(() => {
    try {
      const storedUserInfo = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUserInfo) {
        const parsedUser = JSON.parse(storedUserInfo);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Failed to restore user session:', error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Authenticate user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {object} Result with success status and optional error message
   */
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      setUser(data);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  }, []);

  /**
   * Register a new user account
   * @param {string} name - User's full name
   * @param {string} email - User's email address
   * @param {string} password - User's chosen password
   * @returns {object} Result with success status and optional error message
   */
  const register = useCallback(async (name, email, password) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password,
      });

      setUser(data);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  }, []);

  /**
   * Log out the current user and clear stored session
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
  }), [user, loading, login, register, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
