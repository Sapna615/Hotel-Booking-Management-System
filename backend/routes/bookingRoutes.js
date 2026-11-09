const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  validate,
  bookingHoldSchema,
  confirmBookingSchema,
  cancelBookingSchema,
} = require('../validators/schemas');

// Create temporary hold (10 min expiration)
router.post(
  '/holds',
  authenticate,
  validate(bookingHoldSchema),
  BookingController.createHold
);

// Confirm booking with simulated payment
router.post(
  '/:id/confirm',
  authenticate,
  validate(confirmBookingSchema),
  BookingController.confirmBooking
);

// Cancel booking
router.patch(
  '/:id/cancel',
  authenticate,
  validate(cancelBookingSchema),
  BookingController.cancelBooking
);

// Staff Check-in and Check-out
router.patch(
  '/:id/check-in',
  authenticate,
  authorize('admin', 'staff'),
  BookingController.checkIn
);
router.patch(
  '/:id/check-out',
  authenticate,
  authorize('admin', 'staff'),
  BookingController.checkOut
);

// Guest's own bookings
router.get(
  '/my-bookings',
  authenticate,
  BookingController.getMyBookings
);

// Staff / Admin: List all bookings
router.get(
  '/',
  authenticate,
  authorize('admin', 'staff'),
  BookingController.getAllBookings
);

// Single booking details
router.get(
  '/:id',
  authenticate,
  BookingController.getBookingById
);

module.exports = router;
