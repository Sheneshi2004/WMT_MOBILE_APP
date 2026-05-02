import { z } from 'zod';
import { emailSchema, phoneSchema, nicSchema, idSchema, searchQuerySchema } from './commonSchemas';

// Create Resident Validation
export const createResidentSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema,
  nic: nicSchema,
  course: z.string().min(1, 'Course is required'),
  year: z.number().min(1, 'Year must be between 1 and 5').max(5, 'Year must be between 1 and 5'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).optional().nullable(),
  pincode: z.string().optional(),
  guardianName: z.string().min(1, 'Guardian name is required'),
  guardianPhone: phoneSchema,
  permanentAddress: z.string().optional(),
  checkInDate: z.string().optional(),
  profileImage: z.string().url('Invalid image URL').optional(),
});

// Update Resident Validation
export const updateResidentSchema = createResidentSchema.partial();

// Update Resident Status Validation
export const updateResidentStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'blocked', 'left'], {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
});

// Assign Room to Resident Validation
export const assignRoomSchema = z.object({
  roomId: idSchema,
});

// Search Residents Validation
export const searchResidentsSchema = searchQuerySchema;

// Get Residents by Status Validation
export const getResidentsByStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'blocked', 'left']),
});

// Get Residents by Room Validation
export const getResidentsByRoomSchema = z.object({
  roomId: idSchema,
});

// Get Resident by ID Validation
export const getResidentByIdSchema = z.object({
  id: idSchema,
});

// Delete Resident Validation
export const deleteResidentSchema = z.object({
  id: idSchema,
});

// Update Profile Image Validation
export const updateProfileImageSchema = z.object({
  profileImage: z.string().url('Invalid image URL'),
});

// Get Room History Validation
export const getRoomHistorySchema = z.object({
  id: idSchema,
});