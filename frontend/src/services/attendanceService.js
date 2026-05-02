import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export const attendanceService = {
  // ==================== ATTENDANCE ====================
  
  // Mark attendance
  markAttendance: (data) => api.post(API_ENDPOINTS.ATTENDANCE_MARK, data),
  
  // Get all attendance records
  getAllAttendance: () => api.get(API_ENDPOINTS.ATTENDANCE),
  
  // Get attendance by ID
  getAttendanceById: (id) => api.get(API_ENDPOINTS.ATTENDANCE_BY_ID(id)),
  
  // Get attendance by resident
  getAttendanceByResident: (residentId) => api.get(API_ENDPOINTS.ATTENDANCE_RESIDENT(residentId)),
  
  // Get attendance by date
  getAttendanceByDate: (date) => api.get(API_ENDPOINTS.ATTENDANCE_DATE(date)),
  
  // Get attendance report
  getAttendanceReport: (params) => api.get(API_ENDPOINTS.ATTENDANCE_REPORT, { params }),
  
  // Get attendance statistics
  getAttendanceStatistics: () => api.get(API_ENDPOINTS.ATTENDANCE_STATISTICS),
  
  // Update attendance
  updateAttendance: (id, data) => api.put(API_ENDPOINTS.ATTENDANCE_BY_ID(id), data),
  
  // Delete attendance
  deleteAttendance: (id) => api.delete(API_ENDPOINTS.ATTENDANCE_BY_ID(id)),
  
  // ==================== FOOD PREFERENCE ====================
  
  // Set food preference
  setFoodPreference: (data) => api.post(API_ENDPOINTS.FOOD_PREFERENCE, data),
  
  // Get food preference by resident
  getFoodPreference: (residentId) => api.get(API_ENDPOINTS.FOOD_PREFERENCE_RESIDENT(residentId)),
  
  // Get all food preferences (admin)
  getFoodPreferences: () => api.get(API_ENDPOINTS.FOOD_PREFERENCE),
  
  // Update food preference
  updateFoodPreference: (id, data) => api.put(API_ENDPOINTS.FOOD_PREFERENCE_BY_ID(id), data),
  
  // Delete food preference
  deleteFoodPreference: (id) => api.delete(API_ENDPOINTS.FOOD_PREFERENCE_BY_ID(id)),
  
  // Get today's menu
  getTodaysMenu: () => api.get(API_ENDPOINTS.FOOD_MENU),
  
  // Create meal menu (admin)
  createMealMenu: (data) => api.post(API_ENDPOINTS.FOOD_MENU, data),
  
  // Update meal menu
  updateMealMenu: (id, data) => api.put(`${API_ENDPOINTS.FOOD_MENU}/${id}`, data),
  
  // Delete meal menu
  deleteMealMenu: (id) => api.delete(`${API_ENDPOINTS.FOOD_MENU}/${id}`),
};