import { z } from 'zod';
import { idSchema, dateSchema } from './commonSchemas';

// Create Payment Validation
export const createPaymentSchema = z.object({
  residentId: idSchema,
  amount: z.number().min(0, 'Amount cannot be negative').max(1000000, 'Amount too high'),
  month: dateSchema,
  dueDate: dateSchema,
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'online']).optional(),
  transactionId: z.string().optional(),
}).refine((data) => new Date(data.month) <= new Date(data.dueDate), {
  message: 'Due date must be after month date',
  path: ['dueDate'],
});

// Update Payment Status Validation
export const updatePaymentStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'overdue', 'refunded'], {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
});

// Mark as Paid Validation
export const markAsPaidSchema = z.object({
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'online']),
  transactionId: z.string().optional(),
});

// Get Payments by Resident Validation
export const getPaymentsByResidentSchema = z.object({
  residentId: idSchema,
});

// Get Payments by Month Validation
export const getPaymentsByMonthSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});

// Get Payments by Status Validation
export const getPaymentsByStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'overdue', 'refunded']),
});

// Get Payment by ID Validation
export const getPaymentByIdSchema = z.object({
  id: idSchema,
});

// Delete Payment Validation
export const deletePaymentSchema = z.object({
  id: idSchema,
});