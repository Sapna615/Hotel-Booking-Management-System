const Room = require('../models/Room');
const RoomType = require('../models/RoomType');

class RoomService {
  // Room Types
  static async createRoomType(data) {
    const existing = await RoomType.findOne({ name: data.name });
    if (existing) {
      const err = new Error(`Room type '${data.name}' already exists`);
      err.statusCode = 409;
      throw err;
    }
    return RoomType.create(data);
  }

  static async getAllRoomTypes(includeInactive = false) {
    const filter = includeInactive ? {} : { isActive: true };
    return RoomType.find(filter).sort({ basePrice: 1 });
  }

  static async getRoomTypeById(id) {
    const roomType = await RoomType.findById(id);
    if (!roomType) {
      const err = new Error('Room type not found');
      err.statusCode = 404;
      throw err;
    }
    return roomType;
  }

  static async updateRoomType(id, updateData) {
    const roomType = await RoomType.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!roomType) {
      const err = new Error('Room type not found');
      err.statusCode = 404;
      throw err;
    }
    return roomType;
  }

  // Individual Rooms
  static async createRoom(data) {
    const existing = await Room.findOne({ roomNumber: data.roomNumber.toUpperCase() });
    if (existing) {
      const err = new Error(`Room number '${data.roomNumber}' already exists`);
      err.statusCode = 409;
      throw err;
    }

    const roomType = await RoomType.findById(data.roomTypeId);
    if (!roomType) {
      const err = new Error('Associated RoomType not found');
      err.statusCode = 404;
      throw err;
    }

    const room = await Room.create({
      ...data,
      roomNumber: data.roomNumber.toUpperCase(),
    });
    return room.populate('roomTypeId');
  }

  static async getAllRooms({ status, roomTypeId, floor, page = 1, limit = 50 } = {}) {
    const query = {};
    if (status) query.status = status;
    if (roomTypeId) query.roomTypeId = roomTypeId;
    if (floor !== undefined && floor !== '') query.floor = Number(floor);

    const skip = (Number(page) - 1) * Number(limit);
    const [rooms, total] = await Promise.all([
      Room.find(query)
        .populate('roomTypeId')
        .sort({ roomNumber: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Room.countDocuments(query),
    ]);

    return {
      rooms,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  static async getRoomById(id) {
    const room = await Room.findById(id).populate('roomTypeId');
    if (!room) {
      const err = new Error('Room not found');
      err.statusCode = 404;
      throw err;
    }
    return room;
  }

  static async updateRoomStatus(id, { status, notes }) {
    const room = await Room.findById(id);
    if (!room) {
      const err = new Error('Room not found');
      err.statusCode = 404;
      throw err;
    }

    const prevStatus = room.status;
    room.status = status;
    if (notes !== undefined) {
      room.notes = notes;
    }
    await room.save();
    await room.populate('roomTypeId');

    return { room, prevStatus };
  }

  static async updateRoom(id, updateData) {
    if (updateData.roomNumber) {
      updateData.roomNumber = updateData.roomNumber.toUpperCase();
      const existing = await Room.findOne({
        roomNumber: updateData.roomNumber,
        _id: { $ne: id },
      });
      if (existing) {
        const err = new Error(`Room number '${updateData.roomNumber}' already exists`);
        err.statusCode = 409;
        throw err;
      }
    }

    const room = await Room.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('roomTypeId');

    if (!room) {
      const err = new Error('Room not found');
      err.statusCode = 404;
      throw err;
    }
    return room;
  }
}

module.exports = RoomService;

