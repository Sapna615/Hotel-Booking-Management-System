const BookingService = require('../services/bookingService');
const ApiResponse = require('../utils/apiResponse');
const { recordAuditLog } = require('../utils/auditLogger');

class BookingController {
  // Step 1: Create 10-minute temporary hold
  static async createHold(req, res, next) {
    try {
      const { roomId, checkIn, checkOut, numberOfGuests, guestDetails } = req.body;
      const guestId = req.user._id;

      const booking = await BookingService.createHold({
        guestId,
        roomId,
        checkIn,
        checkOut,
        numberOfGuests,
        guestDetails,
      });

      await recordAuditLog(req, {
        action: 'BOOKING_HOLD_CREATED',
        entityType: 'Booking',
        entityId: booking._id,
        details: {
          reference: booking.bookingReference,
          room: booking.roomId?.roomNumber,
          totalAmount: booking.pricing.totalAmount,
          holdExpiresAt: booking.holdExpiresAt,
        },
      });

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Temporary room hold created. Complete payment within 10 minutes to confirm.',
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  }

  // Step 2: Confirm booking with simulated payment
  static async confirmBooking(req, res, next) {
    try {
      const { id } = req.params;
      const { paymentMethod, shouldSucceed, idempotencyKey } = req.body;

      const result = await BookingService.confirmBooking(id, {
        paymentMethod,
        shouldSucceed,
        idempotencyKey,
      });

      if (!result.alreadyConfirmed) {
        await recordAuditLog(req, {
          action: 'BOOKING_CONFIRMED',
          entityType: 'Booking',
          entityId: result.booking._id,
          details: {
            reference: result.booking.bookingReference,
            paymentId: result.payment?._id,
            totalAmount: result.booking.pricing.totalAmount,
          },
        });
      }

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Reservation confirmed successfully!',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // Cancel reservation
  static async cancelBooking(req, res, next) {
    try {
      const { id } = req.params;
      const { cancellationReason } = req.body;

      const result = await BookingService.cancelBooking(id, req.user, {
        cancellationReason,
      });

      await recordAuditLog(req, {
        action: 'BOOKING_CANCELLED',
        entityType: 'Booking',
        entityId: result.booking._id,
        details: {
          reference: result.booking.bookingReference,
          reason: cancellationReason,
          refundAmount: result.refundPayment?.refundAmount || 0,
        },
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Booking cancelled successfully and room has been released',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // Staff Check-in
  static async checkIn(req, res, next) {
    try {
      const { id } = req.params;
      const booking = await BookingService.checkInGuest(id);

      await recordAuditLog(req, {
        action: 'GUEST_CHECKED_IN',
        entityType: 'Booking',
        entityId: booking._id,
        details: {
          reference: booking.bookingReference,
          room: booking.roomId?.roomNumber,
        },
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: `Guest checked in to room ${booking.roomId?.roomNumber || ''}`,
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  }

  // Staff Check-out
  static async checkOut(req, res, next) {
    try {
      const { id } = req.params;
      const booking = await BookingService.checkOutGuest(id);

      await recordAuditLog(req, {
        action: 'GUEST_CHECKED_OUT',
        entityType: 'Booking',
        entityId: booking._id,
        details: {
          reference: booking.bookingReference,
          room: booking.roomId?.roomNumber,
        },
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: `Guest checked out from room ${booking.roomId?.roomNumber || ''}`,
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  }

  // Guest: My Bookings
  static async getMyBookings(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await BookingService.getGuestBookings(req.user._id, { page, limit });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Guest booking history retrieved',
        data: result.bookings,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  }

  // Staff/Admin: All Bookings
  static async getAllBookings(req, res, next) {
    try {
      const result = await BookingService.getAllBookings(req.query);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Bookings list retrieved',
        data: result.bookings,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  }

  // Booking Details by ID
  static async getBookingById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await BookingService.getBookingById(id, req.user);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Booking details retrieved',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BookingController;

