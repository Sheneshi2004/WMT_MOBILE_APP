import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export const roomService = {
  getAllRooms: () => api.get(API_ENDPOINTS.ROOMS),
  getRoomById: (id) => api.get(API_ENDPOINTS.ROOM_BY_ID(id)),
  getAvailableRooms: () => api.get(API_ENDPOINTS.ROOMS_AVAILABLE),
  createRoom: (data) => api.post(API_ENDPOINTS.ROOMS, data),
  updateRoom: (id, data) => api.put(API_ENDPOINTS.ROOM_BY_ID(id), data),
  updateRoomStatus: (id, status) => api.put(API_ENDPOINTS.ROOM_STATUS(id), { status }),
  deleteRoom: (id) => api.delete(API_ENDPOINTS.ROOM_BY_ID(id)),
  getStatistics: () => api.get(API_ENDPOINTS.ROOMS_STATISTICS),
  getPublicRooms: () => api.get(API_ENDPOINTS.ROOMS_PUBLIC),
  getResidentsInRoom: (id) => api.get(API_ENDPOINTS.ROOM_RESIDENTS(id)),
  addImages: (id, images) => api.post(API_ENDPOINTS.ROOM_IMAGES(id), { images }),
  deleteImage: (id, imageIndex) => api.delete(API_ENDPOINTS.ROOM_IMAGE(id, imageIndex)),
};