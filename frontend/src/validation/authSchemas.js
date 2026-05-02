import { z } from 'zod';
import { emailSchema, passwordSchema, phoneSchema } from './commonSchemas';

// Login Validation
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Register Validation
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Forgot Password Validation
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset Password Validation
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Change Password Validation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Please confirm new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ['confirmNewPassword'],
});

// Update Profile Validation
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: phoneSchema.optional(),
  profileImage: z.string().url('Invalid image URL').optional(),
});

// Token Verification Validation
export const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});