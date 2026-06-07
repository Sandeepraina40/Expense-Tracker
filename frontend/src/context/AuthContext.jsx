import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

import { API_BASE_URL } from '../config/api';

const USER_STORAGE_KEY = 'userInfo';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);
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
