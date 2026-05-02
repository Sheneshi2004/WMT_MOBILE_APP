import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export const complaintService = {
  getAllComplaints: () => api.get(API_ENDPOINTS.COMPLAINTS),
  getComplaintById: (id) => api.get(API_ENDPOINTS.COMPLAINT_BY_ID(id)),
  getComplaintsByResident: (residentId) => api.get(API_ENDPOINTS.COMPLAINTS_RESIDENT(residentId)),
  getComplaintsByStatus: (status) => api.get(API_ENDPOINTS.COMPLAINTS_STATUS(status)),
  getComplaintsByPriority: (priority) => api.get(API_ENDPOINTS.COMPLAINTS_PRIORITY(priority)),
  getStatistics: () => api.get(API_ENDPOINTS.COMPLAINTS_STATISTICS),
  createComplaint: (data) => api.post(API_ENDPOINTS.COMPLAINTS, data),
  updateStatus: (id, status, assignedTo) => api.put(API_ENDPOINTS.COMPLAINT_STATUS(id), { status, assignedTo }),
  resolveComplaint: (id, resolution) => api.put(API_ENDPOINTS.COMPLAINT_RESOLVE(id), { resolution }),
  rateComplaint: (id, rating, feedback) => api.put(API_ENDPOINTS.COMPLAINT_RATE(id), { rating, feedback }),
  deleteComplaint: (id) => api.delete(API_ENDPOINTS.COMPLAINT_BY_ID(id)),
};