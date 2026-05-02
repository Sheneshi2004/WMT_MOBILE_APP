import api from '../lib/axios';
import { API_ENDPOINTS } from '../constants/api';

// Room Services
export const roomService = {
  getAll: () => api.get(API_ENDPOINTS.ROOMS),
  getById: (id) => api.get(API_ENDPOINTS.ROOM_BY_ID(id)),
  create: (data) => api.post(API_ENDPOINTS.ROOMS, data),
  update: (id, data) => api.put(API_ENDPOINTS.ROOM_BY_ID(id), data),
  delete: (id) => api.delete(API_ENDPOINTS.ROOM_BY_ID(id)),
  getPublic: () => api.get(API_ENDPOINTS.ROOMS_PUBLIC),
};

// Resident Services
export const residentService = {
  getAll: () => api.get(API_ENDPOINTS.RESIDENTS),
  getById: (id) => api.get(API_ENDPOINTS.RESIDENT_BY_ID(id)),
  create: (data) => api.post(API_ENDPOINTS.RESIDENTS, data),
  update: (id, data) => api.put(API_ENDPOINTS.RESIDENT_BY_ID(id), data),
  delete: (id) => api.delete(API_ENDPOINTS.RESIDENT_BY_ID(id)),
  assignRoom: (id, roomId) => api.put(API_ENDPOINTS.RESIDENT_ROOM(id), { roomId }),
};

// Visitor Services
export const visitorService = {
  submitRequest: (data) => api.post(API_ENDPOINTS.VISITORS_REQUEST, data),
  getAllRequests: () => api.get(API_ENDPOINTS.VISITORS_REQUESTS),
  approveRequest: (id, data) => api.put(API_ENDPOINTS.VISITOR_APPROVE(id), data),
};