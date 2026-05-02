import { z } from 'zod';

// Sri Lankan NIC Validation
export const nicSchema = z
  .string()
  .min(1, 'NIC is required')
  .regex(/^([0-9]{9}[Vv])|([0-9]{12})$/, 'Please enter a valid Sri Lankan NIC');

// Sri Lankan Phone Number Validation
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits');

// Email Validation
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

// Password Validation
export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters');

// ID Validation (MongoDB ObjectId)
export const idSchema = z
  .string()
  .min(1, 'ID is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

// Date Validation (YYYY-MM-DD)
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date');

// Future Date Validation
export const futureDateSchema = dateSchema.refine(
  (date) => new Date(date) > new Date(),
  { message: 'Date must be in the future' }
);

// Past Date Validation
export const pastDateSchema = dateSchema.refine(
  (date) => new Date(date) < new Date(),
  { message: 'Date must be in the past' }
);

// Pagination Validation
export const paginationSchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(10).optional(),
});

// Search Query Validation
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
});