import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (parseError) {
            console.error('Error parsing stored user:', parseError);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const register = useCallback(async (name, email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      });

      const { token, user: userData } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });

      const { token, user: userData } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};