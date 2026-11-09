const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const RoomOccupancy = require('../models/RoomOccupancy');
const env = require('../config/environment');
const {
  validateDateRange,
  generateOccupancyNights,
} = require('../utils/dateUtils');

class AvailabilityService {
  /**
   * Search available rooms for given date range and optional guest/type criteria
   */
  static async searchAvailability({ checkIn, checkOut, guests = 1, roomTypeId = null }) {
    // 1. Validate date range
    const validation = validateDateRange(checkIn, checkOut);
    if (!validation.valid) {
      const err = new Error(validation.message);
      err.statusCode = 400;
      err.code = 'INVALID_DATE_RANGE';
      throw err;
    }

    const nightsList = generateOccupancyNights(checkIn, checkOut);
    const nightStrings = nightsList.map((n) => n.night);
    const totalNights = nightsList.length;

    // 2. Identify all rooms that have ANY blocked occupancy for the requested nights
    const now = new Date();

    // Clean up expired holds in background or query safely
    const blockedOccupancies = await RoomOccupancy.find({
      night: { $in: nightStrings },
      $or: [
        { status: 'confirmed' },
        {
          status: 'hold',
          holdExpiresAt: { $gt: now },
        },
      ],
    }).select('roomId');

    const blockedRoomIds = blockedOccupancies.map((o) => o.roomId.toString());

    // 3. Find rooms that match capacity, room type, and are in 'available' status
    const roomQuery = {
      status: 'available',
      _id: { $nin: blockedRoomIds },
    };

    if (roomTypeId) {
      roomQuery.roomTypeId = roomTypeId;
    }

    const availableRooms = await Room.find(roomQuery)
      .populate('roomTypeId')
      .sort({ roomNumber: 1 });

    // 4. Filter by guest capacity
    const filteredRooms = availableRooms.filter((room) => {
      if (!room.roomTypeId || !room.roomTypeId.isActive) return false;
      return room.roomTypeId.capacity >= Number(guests);
    });

    // 5. Attach computed pricing breakdown for each room
    const results = filteredRooms.map((room) => {
      const baseNightly = room.roomTypeId.basePrice;
      const roomCharges = baseNightly * totalNights;
      const taxAmount = Math.round((roomCharges * env.TAX_RATE_PERCENT) / 100);
      const serviceFee = Math.round((roomCharges * env.SERVICE_FEE_PERCENT) / 100);
      const totalAmount = roomCharges + taxAmount + serviceFee;

      return {
        room: {
          _id: room._id,
          roomNumber: room.roomNumber,
          floor: room.floor,
          status: room.status,
          roomType: room.roomTypeId,
        },
        pricing: {
          totalNights,
          nightlyRate: baseNightly,
          roomCharges,
          taxAmount,
          serviceFee,
          totalAmount,
          currency: 'INR',
        },
      };
    });

    return {
      checkIn,
      checkOut,
      totalNights,
      guests: Number(guests),
      totalAvailable: results.length,
      rooms: results,
    };
  }

  /**
   * Check if a specific room is available for the given dates
   */
  static async isRoomAvailable(roomId, checkIn, checkOut, excludeBookingId = null) {
    const room = await Room.findById(roomId).populate('roomTypeId');
    if (!room || room.status !== 'available' || !room.roomTypeId?.isActive) {
      return { available: false, reason: 'Room is inactive or under maintenance' };
    }

    const nightsList = generateOccupancyNights(checkIn, checkOut);
    const nightStrings = nightsList.map((n) => n.night);
    const now = new Date();

    const occupancyQuery = {
      roomId,
      night: { $in: nightStrings },
      $or: [
        { status: 'confirmed' },
        { status: 'hold', holdExpiresAt: { $gt: now } },
      ],
    };

    if (excludeBookingId) {
      occupancyQuery.bookingId = { $ne: excludeBookingId };
    }

    const conflictingOccupancy = await RoomOccupancy.findOne(occupancyQuery);

    if (conflictingOccupancy) {
      return {
        available: false,
        reason: 'Room is already reserved or held for one or more requested dates',
        conflictingNight: conflictingOccupancy.night,
      };
    }

    return { available: true, room, nightsList };
  }
}

module.exports = AvailabilityService;

