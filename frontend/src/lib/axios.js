import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '../constants/api';
import { storage } from './storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – automatically add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.removeItem('token');
      await storage.removeItem('user');
      // Navigate to login (handle outside)
    }
    return Promise.reject(error);
  }
);

export default api;