import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await authAPI.getCurrentUser();
        
        if (result.success) {
          setUser(result.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setError('Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authAPI.register(userData);
      
      if (result.success) {
        setUser(result.data);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Error registering user:', error);
      const message = error.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };
  
  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authAPI.login(credentials);
      
      if (result.success) {
        setUser(result.data);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Error logging in:', error);
      const message = error.message || 'Login failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const logout = async () => {
    setLoading(true);
    
    try {
      await authAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Update user
  const updateUser = (userData) => {
    setUser(userData);
  };
  
  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    updateUser,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 