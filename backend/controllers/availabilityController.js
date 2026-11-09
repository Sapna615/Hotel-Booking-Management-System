const AvailabilityService = require('../services/availabilityService');
const ApiResponse = require('../utils/apiResponse');

class AvailabilityController {
  static async searchAvailability(req, res, next) {
    try {
      const { checkIn, checkOut, guests, roomTypeId } = req.query;
      const result = await AvailabilityService.searchAvailability({
        checkIn,
        checkOut,
        guests,
        roomTypeId,
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: `Found ${result.totalAvailable} room(s) available for the requested dates`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async checkRoomAvailability(req, res, next) {
    try {
      const { id } = req.params;
      const { checkIn, checkOut } = req.query;

      if (!checkIn || !checkOut) {
        return ApiResponse.error(res, {
          statusCode: 400,
          message: 'checkIn and checkOut query parameters are required',
        });
      }

      const result = await AvailabilityService.isRoomAvailable(id, checkIn, checkOut);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: result.available ? 'Room is available' : 'Room is not available',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AvailabilityController;
