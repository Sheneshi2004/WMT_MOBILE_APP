import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export const cleaningService = {
  // Create a new cleaning task
  createTask: (data) => api.post(API_ENDPOINTS.CLEANING, data),
  
  // Get all cleaning tasks
  getAllTasks: () => api.get(API_ENDPOINTS.CLEANING),
  
  // Update task status
  updateTaskStatus: (id, status) => api.put(API_ENDPOINTS.CLEANING_STATUS(id), { status }),
  
  // Update full task
  updateTask: (id, data) => api.put(API_ENDPOINTS.CLEANING_BY_ID(id), data),
  
  // Delete a task
  deleteTask: (id) => api.delete(API_ENDPOINTS.CLEANING_BY_ID(id)),
  
  // Get tasks by room
  getTasksByRoom: (roomId) => api.get(API_ENDPOINTS.CLEANING_ROOM(roomId)),
};
