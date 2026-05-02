import { z } from 'zod';
import { emailSchema, phoneSchema, idSchema, futureDateSchema } from './commonSchemas';

// Submit Visit Request Validation (Public)
export const submitVisitRequestSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').min(2, 'Name must be at least 2 characters'),
  phoneNumber: phoneSchema,
  email: emailSchema,
  preferredRoomType: z.enum(['Single', 'Double', 'Triple', 'Shared', 'Any'], {
    errorMap: () => ({ message: 'Please select a valid room type' }),
  }),
  preferredVisitDate: futureDateSchema,
  message: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
});

// Approve Visit Request Validation (Admin)
export const approveVisitRequestSchema = z.object({
  assignedRoomId: idSchema,
  scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, 'Invalid time format').optional(),
  adminNotes: z.string().max(200, 'Notes cannot exceed 200 characters').optional(),
});

// Reject Visit Request Validation
export const rejectVisitRequestSchema = z.object({
  adminNotes: z.string().max(200, 'Notes cannot exceed 200 characters').optional(),
});

// Check-In Validation (Security)
export const checkInSchema = z.object({
  securityGuardName: z.string().min(1, 'Security guard name is required'),
  idCardVerified: z.boolean().default(false),
});

// Check-Out Validation
export const checkOutSchema = z.object({
  // No required fields for check-out
});

// Get Visit Request by ID Validation
export const getVisitRequestByIdSchema = z.object({
  id: idSchema,
});

// Delete Visit Request Validation
export const deleteVisitRequestSchema = z.object({
  id: idSchema,
});