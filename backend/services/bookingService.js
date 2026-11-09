const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const RoomOccupancy = require('../models/RoomOccupancy');
const PaymentService = require('./paymentService');
const env = require('../config/environment');
const {
  validateDateRange,
  generateOccupancyNights,
} = require('../utils/dateUtils');

class BookingService {
  /**
   * Helper to generate human-readable unique booking reference
   */
  static generateReference() {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = uuidv4().split('-')[0].toUpperCase();
    return `HB-${today}-${randomHex}`;
  }

  /**
   * Clean up expired holds for a specific room or globally
   */
  static async cleanupExpiredHolds(roomId = null) {
    const now = new Date();
    const query = {
      status: 'hold',
      holdExpiresAt: { $lte: now },
    };
    if (roomId) {
      query.roomId = roomId;
    }

    // Find all expired hold records
    const expiredHolds = await RoomOccupancy.find(query).select('_id bookingId');
    if (expiredHolds.length > 0) {
      const expiredBookingIds = [...new Set(expiredHolds.map((h) => h.bookingId))];

      // Remove the expired occupancy records so the nights are released
      await RoomOccupancy.deleteMany({ _id: { $in: expiredHolds.map((h) => h._id) } });

      // Mark the corresponding bookings as expired if they are still pending
      await Booking.updateMany(
        { _id: { $in: expiredBookingIds }, status: 'pending' },
        { status: 'expired' }
      );
    }
  }

  /**
   * Step 1: Create a temporary hold for 10 minutes
   */
  static async createHold({ guestId, roomId, checkIn, checkOut, numberOfGuests, guestDetails }) {
    // 1. Validate dates
    const dateValidation = validateDateRange(checkIn, checkOut);
    if (!dateValidation.valid) {
      const err = new Error(dateValidation.message);
      err.statusCode = 400;
      err.code = 'INVALID_DATE_RANGE';
      throw err;
    }

    // 2. Validate room and room type
    const room = await Room.findById(roomId).populate('roomTypeId');
    if (!room) {
      const err = new Error('Room not found');
      err.statusCode = 404;
      throw err;
    }

    if (room.status !== 'available') {
      const err = new Error(`Room ${room.roomNumber} is currently under maintenance or inactive`);
      err.statusCode = 400;
      err.code = 'ROOM_NOT_AVAILABLE';
      throw err;
    }

    if (numberOfGuests > room.roomTypeId.capacity) {
      const err = new Error(
        `Number of guests (${numberOfGuests}) exceeds room capacity (${room.roomTypeId.capacity})`
      );
      err.statusCode = 400;
      err.code = 'EXCEEDS_CAPACITY';
      throw err;
    }

    // 3. Proactively clean up expired holds
    await this.cleanupExpiredHolds(roomId);

    // 4. Generate night list
    const nightsList = generateOccupancyNights(checkIn, checkOut);
    const nightStrings = nightsList.map((n) => n.night);
    const totalNights = nightsList.length;

    // 5. Check if any requested night is blocked
    const now = new Date();
    const conflictingOccupancy = await RoomOccupancy.findOne({
      roomId: room._id,
      night: { $in: nightStrings },
      $or: [
        { status: 'confirmed' },
        { status: 'hold', holdExpiresAt: { $gt: now } },
      ],
    });

    if (conflictingOccupancy) {
      const err = new Error(
        `Room ${room.roomNumber} is already occupied or held for date ${conflictingOccupancy.night}`
      );
      err.statusCode = 409;
      err.code = 'ROOM_CONFLICT';
      throw err;
    }

    // 6. Calculate snapshot price
    const nightlyRate = room.roomTypeId.basePrice;
    const totalRoomCharges = nightlyRate * totalNights;
    const taxAmount = Math.round((totalRoomCharges * env.TAX_RATE_PERCENT) / 100);
    const serviceFee = Math.round((totalRoomCharges * env.SERVICE_FEE_PERCENT) / 100);
    const totalAmount = totalRoomCharges + taxAmount + serviceFee;

    const holdExpiresAt = new Date(Date.now() + env.HOLD_EXPIRY_MINUTES * 60 * 1000);
    const bookingReference = this.generateReference();

    // 7. Create booking record in 'pending' status
    const booking = new Booking({
      bookingReference,
      guestId,
      roomId: room._id,
      roomTypeId: room.roomTypeId._id,
      guestDetails,
      checkIn: nightsList[0].date,
      checkOut: new Date(nightsList[nightsList.length - 1].date.getTime() + 24 * 60 * 60 * 1000),
      nights: totalNights,
      numberOfGuests,
      pricing: {
        nightlyRate,
        totalRoomCharges,
        taxAmount,
        serviceFee,
        totalAmount,
        currency: 'INR',
      },
      status: 'pending',
      holdExpiresAt,
      paymentStatus: 'unpaid',
    });

    await booking.save();

    // 8. Attempt atomic insertion of occupancy records
    try {
      const occupancyDocs = nightsList.map((item) => ({
        roomId: room._id,
        night: item.night,
        date: item.date,
        bookingId: booking._id,
        status: 'hold',
        holdExpiresAt,
      }));

      await RoomOccupancy.insertMany(occupancyDocs, { ordered: true });
    } catch (insertError) {
      // If concurrent request booked or held this room, rollback pending booking
      await Booking.findByIdAndDelete(booking._id);

      if (insertError.code === 11000) {
        const err = new Error(
          `Conflict: Room ${room.roomNumber} was held by another user during reservation. Please try again.`
        );
        err.statusCode = 409;
        err.code = 'CONCURRENT_BOOKING_CONFLICT';
        throw err;
      }
      throw insertError;
    }

    await booking.populate(['roomId', 'roomTypeId']);
    return booking;
  }

  /**
   * Step 2: Confirm booking after successful simulated payment
   */
  static async confirmBooking(bookingId, { paymentMethod = 'simulated', shouldSucceed = true, idempotencyKey = null }) {
    const booking = await Booking.findById(bookingId).populate(['roomId', 'roomTypeId']);
    if (!booking) {
      const err = new Error('Booking not found');
      err.statusCode = 404;
      throw err;
    }

    if (booking.status === 'confirmed') {
      return { booking, alreadyConfirmed: true };
    }

    if (booking.status !== 'pending') {
      const err = new Error(`Cannot confirm booking in '${booking.status}' status`);
      err.statusCode = 400;
      err.code = 'INVALID_STATUS_TRANSITION';
      throw err;
    }

    // Check if hold has expired
    const now = new Date();
    if (booking.holdExpiresAt && booking.holdExpiresAt < now) {
      booking.status = 'expired';
      await booking.save();
      await RoomOccupancy.deleteMany({ bookingId: booking._id, status: 'hold' });

      const err = new Error('Your reservation hold has expired. Please select a room again.');
      err.statusCode = 400;
      err.code = 'HOLD_EXPIRED';
      throw err;
    }

    // Process simulated payment
    const payment = await PaymentService.processPayment({
      bookingId: booking._id,
      amount: booking.pricing.totalAmount,
      currency: booking.pricing.currency,
      method: paymentMethod,
      shouldSucceed,
      idempotencyKey,
    });

    if (payment.status === 'failed') {
      booking.status = 'failed';
      booking.paymentStatus = 'failed';
      await booking.save();

      // Release hold occupancy immediately so other guests can book
      await RoomOccupancy.deleteMany({ bookingId: booking._id });

      const err = new Error('Simulated payment failed. Reservation could not be confirmed.');
      err.statusCode = 402;
      err.code = 'PAYMENT_FAILED';
      err.details = { paymentId: payment._id, reason: payment.failureReason };
      throw err;
    }

    // Payment succeeded: promote status to confirmed and lock occupancies
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    await booking.save();

    await RoomOccupancy.updateMany(
      { bookingId: booking._id },
      { status: 'confirmed', holdExpiresAt: null }
    );

    return { booking, payment };
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(bookingId, user, { cancellationReason = 'Guest cancellation' }) {
    const booking = await Booking.findById(bookingId).populate(['roomId', 'roomTypeId']);
    if (!booking) {
      const err = new Error('Booking not found');
      err.statusCode = 404;
      throw err;
    }

    // Authorization check: Guests can only cancel their own bookings
    if (user.role === 'guest' && booking.guestId.toString() !== user._id.toString()) {
      const err = new Error('Unauthorized: You can only cancel your own bookings');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    // Check valid state for cancellation
    if (!['pending', 'confirmed'].includes(booking.status)) {
      const err = new Error(`Cannot cancel a booking in '${booking.status}' status`);
      err.statusCode = 400;
      err.code = 'INVALID_STATUS_TRANSITION';
      throw err;
    }

    // Release all occupancy records
    await RoomOccupancy.deleteMany({ bookingId: booking._id });

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = cancellationReason;

    // Refund simulation if payment was paid
    let refundPayment = null;
    if (booking.paymentStatus === 'paid') {
      refundPayment = await PaymentService.processRefund({
        bookingId: booking._id,
        refundAmount: booking.pricing.totalAmount,
        reason: cancellationReason,
      });
      booking.paymentStatus = 'refunded';
    }

    await booking.save();
    return { booking, refundPayment };
  }

  /**
   * Staff Check-in
   */
  static async checkInGuest(bookingId) {
    const booking = await Booking.findById(bookingId).populate(['roomId', 'roomTypeId', 'guestId']);
    if (!booking) {
      const err = new Error('Booking not found');
      err.statusCode = 404;
      throw err;
    }

    if (booking.status !== 'confirmed') {
      const err = new Error(`Cannot check in booking in '${booking.status}' status (must be 'confirmed')`);
      err.statusCode = 400;
      err.code = 'INVALID_STATUS_TRANSITION';
      throw err;
    }

    booking.status = 'checked-in';
    booking.checkedInAt = new Date();
    await booking.save();

    return booking;
  }

  /**
   * Staff Check-out
   */
  static async checkOutGuest(bookingId) {
    const booking = await Booking.findById(bookingId).populate(['roomId', 'roomTypeId', 'guestId']);
    if (!booking) {
      const err = new Error('Booking not found');
      err.statusCode = 404;
      throw err;
    }

    if (booking.status !== 'checked-in') {
      const err = new Error(`Cannot check out booking in '${booking.status}' status (must be 'checked-in')`);
      err.statusCode = 400;
      err.code = 'INVALID_STATUS_TRANSITION';
      throw err;
    }

    booking.status = 'checked-out';
    booking.checkedOutAt = new Date();
    await booking.save();

    // Release room occupancy for completed stay
    await RoomOccupancy.deleteMany({ bookingId: booking._id });

    return booking;
  }

  /**
   * Get guest's own booking history
   */
  static async getGuestBookings(guestId, { page = 1, limit = 20 } = {}) {
    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find({ guestId })
        .populate(['roomId', 'roomTypeId'])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments({ guestId }),
    ]);

    return {
      bookings,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  /**
   * Staff/Admin: Get all bookings with filtering & pagination
   */
  static async getAllBookings({ status, checkIn, checkOut, search, page = 1, limit = 20 } = {}) {
    const query = {};
    if (status) query.status = status;
    if (checkIn) query.checkIn = { $gte: new Date(checkIn) };
    if (checkOut) query.checkOut = { $lte: new Date(checkOut) };

    if (search) {
      query.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { 'guestDetails.name': { $regex: search, $options: 'i' } },
        { 'guestDetails.email': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate(['roomId', 'roomTypeId', 'guestId'])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(query),
    ]);

    return {
      bookings,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  /**
   * Get single booking by ID with access verification
   */
  static async getBookingById(bookingId, user) {
    const booking = await Booking.findById(bookingId).populate(['roomId', 'roomTypeId', 'guestId']);
    if (!booking) {
      const err = new Error('Booking not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.role === 'guest' && booking.guestId._id.toString() !== user._id.toString()) {
      const err = new Error('Access denied to this reservation');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    const payments = await PaymentService.getPaymentByBookingId(bookingId);

    return { booking, payments };
  }
}

module.exports = BookingService;

