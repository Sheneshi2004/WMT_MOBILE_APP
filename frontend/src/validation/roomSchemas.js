import { z } from 'zod';
import { idSchema, searchQuerySchema, paginationSchema } from './commonSchemas';

// Room Number Validation
export const roomNumberSchema = z
  .string()
  .min(1, 'Room number is required')
  .max(10, 'Room number cannot exceed 10 characters')
  .regex(/^[A-Z0-9]+$/i, 'Room number must contain only letters and numbers');

// Create Room Validation
export const createRoomSchema = z.object({
  roomNumber: roomNumberSchema,
  roomType: z.enum(['Single', 'Double', 'Triple', 'Shared'], {
    errorMap: () => ({ message: 'Please select a valid room type' }),
  }),
  capacity: z
    .number({ required_error: 'Capacity is required', invalid_type_error: 'Capacity must be a number' })
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .max(10, 'Capacity cannot exceed 10'),
  pricePerMonth: z
    .number({ required_error: 'Price is required', invalid_type_error: 'Price must be a number' })
    .min(0, 'Price cannot be negative')
    .max(100000, 'Price cannot exceed LKR 100,000'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  facilities: z.array(z.string()).max(10, 'Cannot select more than 10 facilities').optional(),
  images: z.array(z.string().url('Invalid image URL')).max(5, 'Maximum 5 images allowed').optional(),
});

// Update Room Validation
export const updateRoomSchema = createRoomSchema.partial();

// Update Room Status Validation
export const updateRoomStatusSchema = z.object({
  status: z.enum(['available', 'occupied', 'maintenance', 'reserved'], {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),
});

// Filter Rooms Validation
export const filterRoomsSchema = z.object({
  roomType: z.enum(['Single', 'Double', 'Triple', 'Shared']).optional(),
  status: z.enum(['available', 'occupied', 'maintenance', 'reserved']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  capacity: z.number().min(1).max(10).optional(),
}).refine(
  (data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  { message: 'Minimum price cannot be greater than maximum price', path: ['minPrice'] }
);

// Search Rooms Validation
export const searchRoomsSchema = searchQuerySchema;

// Get Room by ID Validation
export const getRoomByIdSchema = z.object({
  id: idSchema,
});

// Delete Room Validation
export const deleteRoomSchema = z.object({
  id: idSchema,
});

// Set Reminder Validation
export const setReminderSchema = z.object({
  reminderDate: z.string().min(1, 'Reminder date is required'),
  reminderMessage: z.string().max(200, 'Message cannot exceed 200 characters').optional(),
});

// Get Room Residents Validation
export const getRoomResidentsSchema = z.object({
  id: idSchema,
});

// Add Room Images Validation
export const addRoomImagesSchema = z.object({
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required').max(5, 'Maximum 5 images allowed'),
});

// Delete Room Image Validation
export const deleteRoomImageSchema = z.object({
  id: idSchema,
  imageIndex: z.string().regex(/^\d+$/, 'Invalid image index'),
});