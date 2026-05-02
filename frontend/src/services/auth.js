import api from '../lib/axios';
import { API_ENDPOINTS } from '../constants/api';

export const authService = {
  // Login user
  login: (email, password) => 
    api.post(API_ENDPOINTS.AUTH_LOGIN, { email, password }),
  
  // Register user
  register: (userData) => 
    api.post(API_ENDPOINTS.AUTH_REGISTER, userData),
  
  // Get user profile
  getProfile: () => 
    api.get(API_ENDPOINTS.AUTH_PROFILE),
  
  // Update profile
  updateProfile: (data) => 
    api.put(API_ENDPOINTS.AUTH_PROFILE, data),
  
  // Verify token
  verifyToken: () => 
    api.post(API_ENDPOINTS.AUTH_VERIFY_TOKEN),
};