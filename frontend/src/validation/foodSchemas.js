import { z } from 'zod';
import { idSchema, dateSchema } from './commonSchemas';

// Set Food Preference Validation (Resident)
export const setFoodPreferenceSchema = z.object({
  residentId: idSchema,
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'all'], {
    errorMap: () => ({ message: 'Please select a meal type' }),
  }),
  preference: z.enum(['veg', 'non-veg', 'vegan', 'jain'], {
    errorMap: () => ({ message: 'Please select a food preference' }),
  }),
  specialRequests: z.string().max(200, 'Special requests cannot exceed 200 characters').optional(),
  allergies: z.array(z.string()).max(10, 'Cannot select more than 10 allergies').optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
});

// Update Food Preference Validation
export const updateFoodPreferenceSchema = setFoodPreferenceSchema.partial();

// Get Food Preference by Resident Validation
export const getFoodPreferenceByResidentSchema = z.object({
  residentId: idSchema,
});

// Set Meal Menu Validation (Admin)
export const setMealMenuSchema = z.object({
  date: dateSchema,
  breakfast: z.object({
    item: z.string().min(1, 'Breakfast item is required'),
    time: z.string().optional(),
  }),
  lunch: z.object({
    item: z.string().min(1, 'Lunch item is required'),
    time: z.string().optional(),
  }),
  dinner: z.object({
    item: z.string().min(1, 'Dinner item is required'),
    time: z.string().optional(),
  }),
  special: z.string().max(200, 'Special note cannot exceed 200 characters').optional(),
});

// Get Food Preference by ID Validation
export const getFoodPreferenceByIdSchema = z.object({
  id: idSchema,
});

// Delete Food Preference Validation
export const deleteFoodPreferenceSchema = z.object({
  id: idSchema,
});