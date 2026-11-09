const { z } = require('zod');
const ApiResponse = require('../utils/apiResponse');

/**
 * Higher-order middleware to validate incoming request data using Zod
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.parse(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return ApiResponse.error(res, {
          statusCode: 400,
          message: 'Request validation failed',
          errors,
          code: 'VALIDATION_ERROR',
        });
      }
      next(err);
    }
  };
};

// Auth Schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional().default(''),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Room Type Schemas
const roomTypeSchema = z.object({
  name: z.string().min(2, 'Room type name must be at least 2 characters').max(80),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  basePrice: z.number().positive('Base price must be a positive number'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(10, 'Capacity cannot exceed 10'),
  amenities: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

// Room Schemas
const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required').max(20),
  roomTypeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid roomTypeId format'),
  floor: z.number().int().min(0, 'Floor must be a non-negative integer'),
  status: z.enum(['available', 'maintenance', 'inactive']).optional().default('available'),
  notes: z.string().optional().default(''),
});

const roomStatusUpdateSchema = z.object({
  status: z.enum(['available', 'maintenance', 'inactive']),
  notes: z.string().optional(),
});

// Availability Query Schema
const availabilityQuerySchema = z.object({
  checkIn: z.string().min(1, 'checkIn date is required (YYYY-MM-DD)'),
  checkOut: z.string().min(1, 'checkOut date is required (YYYY-MM-DD)'),
  guests: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  roomTypeId: z.string().optional(),
});

// Booking Hold Schema (Step 1: creating hold)
const bookingHoldSchema = z.object({
  roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid roomId format'),
  checkIn: z.string().min(1, 'checkIn date is required (YYYY-MM-DD)'),
  checkOut: z.string().min(1, 'checkOut date is required (YYYY-MM-DD)'),
  numberOfGuests: z.number().int().min(1, 'Number of guests must be at least 1'),
  guestDetails: z.object({
    name: z.string().min(2, 'Guest name is required'),
    email: z.string().email('Valid guest email is required'),
    phone: z.string().min(5, 'Phone number is required'),
    specialRequests: z.string().optional().default(''),
  }),
});

// Payment & Confirmation Schema (Step 2: pay and confirm hold)
const confirmBookingSchema = z.object({
  paymentMethod: z.enum(['credit_card', 'debit_card', 'upi', 'net_banking', 'simulated']).optional().default('simulated'),
  shouldSucceed: z.boolean().optional().default(true),
  idempotencyKey: z.string().optional(),
});

// Cancellation Schema
const cancelBookingSchema = z.object({
  cancellationReason: z.string().min(3, 'Please provide a valid cancellation reason').optional().default('Guest requested cancellation'),
});

// Admin User Management Schema
const updateUserRoleSchema = z.object({
  role: z.enum(['guest', 'staff', 'admin']),
  isActive: z.boolean().optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  roomTypeSchema,
  roomSchema,
  roomStatusUpdateSchema,
  availabilityQuerySchema,
  bookingHoldSchema,
  confirmBookingSchema,
  cancelBookingSchema,
  updateUserRoleSchema,
};

