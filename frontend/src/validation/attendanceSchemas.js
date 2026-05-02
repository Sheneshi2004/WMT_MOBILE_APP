import { z } from 'zod';
import { idSchema, dateSchema } from './commonSchemas';

// Mark Attendance Validation
export const markAttendanceSchema = z.object({
  residentId: idSchema,
  date: dateSchema,
  status: z.enum(['present', 'absent', 'late', 'leave', 'holiday'], {
    errorMap: () => ({ message: 'Please select a valid attendance status' }),
  }),
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 'Invalid time format').optional(),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 'Invalid time format').optional(),
  lateMinutes: z.number().min(0).default(0).optional(),
  leaveType: z.enum(['sick', 'casual', 'emergency', 'vacation']).optional(),
  remarks: z.string().max(200, 'Remarks cannot exceed 200 characters').optional(),
});

// Update Attendance Validation
export const updateAttendanceSchema = markAttendanceSchema.partial();

// Get Attendance by Resident Validation
export const getAttendanceByResidentSchema = z.object({
  residentId: idSchema,
});

// Get Attendance by Date Validation
export const getAttendanceByDateSchema = z.object({
  date: dateSchema,
});

// Get Attendance Report Validation
export const getAttendanceReportSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(new Date().getFullYear()),
  residentId: idSchema.optional(),
});

// Get Attendance by ID Validation
export const getAttendanceByIdSchema = z.object({
  id: idSchema,
});

// Delete Attendance Validation
export const deleteAttendanceSchema = z.object({
  id: idSchema,
});