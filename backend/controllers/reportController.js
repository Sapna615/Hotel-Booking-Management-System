const ReportService = require('../services/reportService');
const ApiResponse = require('../utils/apiResponse');

class ReportController {
  static async getSummary(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await ReportService.getSummaryReport(startDate, endDate);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Dashboard summary report generated',
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getOccupancy(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await ReportService.getOccupancyReport(startDate, endDate);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Occupancy trend report generated',
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getRevenue(req, res, next) {
    try {
      const report = await ReportService.getRevenueReport();
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Monthly revenue report generated',
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ReportController;
