import { z } from 'zod';
import { idSchema } from './commonSchemas';

// Create Complaint Validation
export const createComplaintSchema = z.object({
  residentId: idSchema,
  category: z.enum(['maintenance', 'electricity', 'water', 'food', 'cleanliness', 'security', 'other'], {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description cannot exceed 1000 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  images: z.array(z.string().url('Invalid image URL')).max(5, 'Maximum 5 images allowed').optional(),
});

// Update Complaint Status Validation
export const updateComplaintStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'rejected'], {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
  assignedTo: z.string().optional(),
});

// Resolve Complaint Validation
export const resolveComplaintSchema = z.object({
  resolution: z.string().min(1, 'Resolution is required').max(500, 'Resolution cannot exceed 500 characters'),
});

// Rate Complaint Validation
export const rateComplaintSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  feedback: z.string().max(200, 'Feedback cannot exceed 200 characters').optional(),
});

// Get Complaints by Resident Validation
export const getComplaintsByResidentSchema = z.object({
  residentId: idSchema,
});

// Get Complaints by Status Validation
export const getComplaintsByStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'rejected']),
});

// Get Complaints by Priority Validation
export const getComplaintsByPrioritySchema = z.object({
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

// Get Complaint by ID Validation
export const getComplaintByIdSchema = z.object({
  id: idSchema,
});

// Delete Complaint Validation
export const deleteComplaintSchema = z.object({
  id: idSchema,
});