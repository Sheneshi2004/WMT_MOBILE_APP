import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export const visitorService = {
  submitRequest: (data) => api.post(API_ENDPOINTS.VISITORS_REQUEST, data),
  getAllRequests: () => api.get(API_ENDPOINTS.VISITORS_REQUESTS),
  getPendingRequests: () => api.get(API_ENDPOINTS.VISITORS_PENDING),
  getApprovedRequests: () => api.get(API_ENDPOINTS.VISITORS_APPROVED),
  getStatistics: () => api.get(API_ENDPOINTS.VISITORS_STATISTICS),
  getRequestById: (id) => api.get(API_ENDPOINTS.VISITOR_BY_ID(id)),
  approveRequest: (id, data) => api.put(API_ENDPOINTS.VISITOR_APPROVE(id), data),
  rejectRequest: (id, data) => api.put(API_ENDPOINTS.VISITOR_REJECT(id), data),
  checkIn: (id, data) => api.put(API_ENDPOINTS.VISITOR_CHECK_IN(id), data),
  checkOut: (id) => api.put(API_ENDPOINTS.VISITOR_CHECK_OUT(id)),
  deleteRequest: (id) => api.delete(API_ENDPOINTS.VISITOR_BY_ID(id)),
};