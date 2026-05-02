import React, { createContext, useState, useContext, useEffect } from 'react';
import { storage } from '../lib/storage';
import api from '../lib/axios';
import { API_ENDPOINTS } from '../constants/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load saved user on app start
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await storage.getToken();
      const savedUser = await storage.getUser();
      
      if (token && savedUser) {
        setUser(savedUser);
        setIsAuthenticated(true);
        // Set token in axios headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Load user error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH_LOGIN, { email, password });
      
      if (response.data.success) {
        const userData = response.data.data;
        const token = userData.token;
        
        // Save to storage
        await storage.setToken(token);
        await storage.setUser(userData);
        
        // Set token in axios headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, data: userData };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH_REGISTER, userData);
      
      if (response.data.success) {
        const newUser = response.data.data;
        const token = newUser.token;
        
        await storage.setToken(token);
        await storage.setUser(newUser);
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(newUser);
        setIsAuthenticated(true);
        
        return { success: true, data: newUser };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    await storage.clear();
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    storage.setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};