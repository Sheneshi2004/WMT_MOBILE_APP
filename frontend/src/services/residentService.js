import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export const residentService = {
  getAll: () => api.get(API_ENDPOINTS.RESIDENTS),
  getById: (id) => api.get(API_ENDPOINTS.RESIDENT_BY_ID(id)),
  create: (data) => api.post(API_ENDPOINTS.RESIDENTS, data),
  update: (id, data) => api.put(API_ENDPOINTS.RESIDENT_BY_ID(id), data),
  getMyProfile: () => api.get(`${API_ENDPOINTS.RESIDENTS}/me`),                  // ✅ New
  updateMyProfile: (data) => api.put(`${API_ENDPOINTS.RESIDENTS}/me`, data),
  bookRoom: (roomId) => api.put(`${API_ENDPOINTS.RESIDENTS}/me/book`, { roomId }), // ✅ New
  delete: (id) => api.delete(API_ENDPOINTS.RESIDENT_BY_ID(id)),
  assignRoom: (id, roomId) => api.put(API_ENDPOINTS.RESIDENT_ROOM(id), { roomId }), // admin only
  updateStatus: (id, status) => api.put(API_ENDPOINTS.RESIDENT_STATUS(id), { status }),
  search: (query) => api.get(API_ENDPOINTS.RESIDENTS_SEARCH, { params: { q: query } }),
  getByStatus: (status) => api.get(API_ENDPOINTS.RESIDENTS_STATUS(status)),
  getByRoom: (roomId) => api.get(API_ENDPOINTS.RESIDENTS_ROOM(roomId)),
  getHistory: (id) => api.get(API_ENDPOINTS.RESIDENT_HISTORY(id)),
  updateProfileImage: (id, profileImage) => api.put(API_ENDPOINTS.RESIDENT_PROFILE_IMAGE(id), { profileImage }),
};