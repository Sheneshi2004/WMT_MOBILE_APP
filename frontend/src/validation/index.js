// Common Schemas
export * from './commonSchemas';

// Auth Schemas
export {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  verifyTokenSchema,
} from './authSchemas';

// Room Schemas (Member 1)
export {
  createRoomSchema,
  updateRoomSchema,
  updateRoomStatusSchema,
  filterRoomsSchema,
  searchRoomsSchema,
  getRoomByIdSchema,
  deleteRoomSchema,
  setReminderSchema,
  getRoomResidentsSchema,
  addRoomImagesSchema,
  deleteRoomImageSchema,
} from './roomSchemas';

// Resident Schemas (Member 2)
export {
  createResidentSchema,
  updateResidentSchema,
  updateResidentStatusSchema,
  assignRoomSchema,
  searchResidentsSchema,
  getResidentsByStatusSchema,
  getResidentsByRoomSchema,
  getResidentByIdSchema,
  deleteResidentSchema,
  updateProfileImageSchema,
  getRoomHistorySchema,
} from './residentSchemas';

// Payment Schemas (Member 3)
export {
  createPaymentSchema,
  updatePaymentStatusSchema,
  markAsPaidSchema,
  getPaymentsByResidentSchema,
  getPaymentsByMonthSchema,
  getPaymentsByStatusSchema,
  getPaymentByIdSchema,
  deletePaymentSchema,
} from './paymentSchemas';

// Complaint Schemas (Member 4)
export {
  createComplaintSchema,
  updateComplaintStatusSchema,
  resolveComplaintSchema,
  rateComplaintSchema,
  getComplaintsByResidentSchema,
  getComplaintsByStatusSchema,
  getComplaintsByPrioritySchema,
  getComplaintByIdSchema,
  deleteComplaintSchema,
} from './complaintSchemas';

// Visitor Schemas (Member 6)
export {
  submitVisitRequestSchema,
  approveVisitRequestSchema,
  rejectVisitRequestSchema,
  checkInSchema,
  checkOutSchema,
  getVisitRequestByIdSchema,
  deleteVisitRequestSchema,
} from './visitorSchemas';

// Attendance Schemas (Member 5)
export {
  markAttendanceSchema,
  updateAttendanceSchema,
  getAttendanceByResidentSchema,
  getAttendanceByDateSchema,
  getAttendanceReportSchema,
  getAttendanceByIdSchema,
  deleteAttendanceSchema,
} from './attendanceSchemas';

// Food Schemas (Member 5)
export {
  setFoodPreferenceSchema,
  updateFoodPreferenceSchema,
  getFoodPreferenceByResidentSchema,
  setMealMenuSchema,
  getFoodPreferenceByIdSchema,
  deleteFoodPreferenceSchema,
} from './foodSchemas';