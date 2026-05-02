import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export const paymentService = {
  getAll: () => api.get(API_ENDPOINTS.PAYMENTS),
  getById: (id) => api.get(API_ENDPOINTS.PAYMENT_BY_ID(id)),
   getPaymentsByResident: (residentId) => api.get(API_ENDPOINTS.PAYMENTS_RESIDENT(residentId)),
  getByMonth: (month) => api.get(API_ENDPOINTS.PAYMENTS_MONTH(month)),
  getByStatus: (status) => api.get(API_ENDPOINTS.PAYMENTS_STATUS(status)),
  getStatistics: () => api.get(API_ENDPOINTS.PAYMENTS_STATISTICS),
  create: (data) => api.post(API_ENDPOINTS.PAYMENTS, data),
  createBatch: (data) => api.post(`${API_ENDPOINTS.PAYMENTS}/generate-monthly-bills`, data),
  updateStatus: (id, status) => api.put(API_ENDPOINTS.PAYMENT_STATUS(id), { status }),
  markAsPaid: (id, data) => api.put(API_ENDPOINTS.PAYMENT_PAY(id), data),
  processCard: (id, cardData) => api.post(API_ENDPOINTS.PAYMENT_PROCESS_CARD(id), cardData),
  delete: (id) => api.delete(API_ENDPOINTS.PAYMENT_BY_ID(id)),
};