const RoomService = require('../services/roomService');
const ApiResponse = require('../utils/apiResponse');
const { recordAuditLog } = require('../utils/auditLogger');

class RoomController {
  // Room Types
  static async createRoomType(req, res, next) {
    try {
      const roomType = await RoomService.createRoomType(req.body);

      await recordAuditLog(req, {
        action: 'ROOM_TYPE_CREATED',
        entityType: 'RoomType',
        entityId: roomType._id,
        details: { name: roomType.name, basePrice: roomType.basePrice },
      });

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Room type created successfully',
        data: roomType,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllRoomTypes(req, res, next) {
    try {
      const roomTypes = await RoomService.getAllRoomTypes();
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Room types retrieved successfully',
        data: roomTypes,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getRoomTypeById(req, res, next) {
    try {
      const roomType = await RoomService.getRoomTypeById(req.params.id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Room type retrieved successfully',
        data: roomType,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateRoomType(req, res, next) {
    try {
      const roomType = await RoomService.updateRoomType(req.params.id, req.body);

      await recordAuditLog(req, {
        action: 'ROOM_TYPE_UPDATED',
        entityType: 'RoomType',
        entityId: roomType._id,
        details: req.body,
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Room type updated successfully',
        data: roomType,
      });
    } catch (err) {
      next(err);
    }
  }

  // Individual Rooms
  static async createRoom(req, res, next) {
    try {
      const room = await RoomService.createRoom(req.body);

      await recordAuditLog(req, {
        action: 'ROOM_CREATED',
        entityType: 'Room',
        entityId: room._id,
        details: { roomNumber: room.roomNumber, floor: room.floor },
      });

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Room created successfully',
        data: room,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllRooms(req, res, next) {
    try {
      const result = await RoomService.getAllRooms(req.query);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Rooms retrieved successfully',
        data: result.rooms,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getRoomById(req, res, next) {
    try {
      const room = await RoomService.getRoomById(req.params.id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Room details retrieved',
        data: room,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateRoomStatus(req, res, next) {
    try {
      const { status, notes } = req.body;
      const { room, prevStatus } = await RoomService.updateRoomStatus(req.params.id, { status, notes });

      await recordAuditLog(req, {
        action: 'ROOM_STATUS_CHANGED',
        entityType: 'Room',
        entityId: room._id,
        details: { from: prevStatus, to: status, notes },
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: `Room status updated to '${status}'`,
        data: room,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateRoom(req, res, next) {
    try {
      const room = await RoomService.updateRoom(req.params.id, req.body);

      await recordAuditLog(req, {
        action: 'ROOM_UPDATED',
        entityType: 'Room',
        entityId: room._id,
        details: req.body,
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Room updated successfully',
        data: room,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = RoomController;

