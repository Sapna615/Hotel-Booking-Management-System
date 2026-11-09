const Booking = require('../models/Booking');
const Room = require('../models/Room');
const RoomOccupancy = require('../models/RoomOccupancy');
const Payment = require('../models/Payment');
const { normalizeToUtcMidnight } = require('../utils/dateUtils');

class ReportService {
  /**
   * Executive Dashboard Summary
   */
  static async getSummaryReport(startDateInput = null, endDateInput = null) {
    const now = new Date();
    const today = normalizeToUtcMidnight(now);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Optional date filter for revenue & bookings
    const bookingDateFilter = {};
    if (startDateInput && endDateInput) {
      bookingDateFilter.createdAt = {
        $gte: new Date(startDateInput),
        $lte: new Date(endDateInput),
      };
    }

    // 1. Total rooms and room breakdown
    const totalRoomsCount = await Room.countDocuments({ status: { $ne: 'inactive' } });
    const availableRoomsCount = await Room.countDocuments({ status: 'available' });
    const maintenanceRoomsCount = await Room.countDocuments({ status: 'maintenance' });

    // 2. Booking counts
    const [
      totalBookings,
      confirmedBookings,
      checkedInBookings,
      checkedOutBookings,
      cancelledBookings,
    ] = await Promise.all([
      Booking.countDocuments(bookingDateFilter),
      Booking.countDocuments({ ...bookingDateFilter, status: 'confirmed' }),
      Booking.countDocuments({ ...bookingDateFilter, status: 'checked-in' }),
      Booking.countDocuments({ ...bookingDateFilter, status: 'checked-out' }),
      Booking.countDocuments({ ...bookingDateFilter, status: 'cancelled' }),
    ]);

    // 3. Today's Arrivals and Departures
    const [todayArrivals, todayDepartures] = await Promise.all([
      Booking.find({
        status: { $in: ['confirmed', 'checked-in'] },
        checkIn: { $gte: today, $lt: tomorrow },
      }).populate(['roomId', 'roomTypeId', 'guestId']),
      Booking.find({
        status: { $in: ['confirmed', 'checked-in'] },
        checkOut: { $gte: today, $lt: tomorrow },
      }).populate(['roomId', 'roomTypeId', 'guestId']),
    ]);

    // 4. Financial Calculations from actual payments
    const successfulPayments = await Payment.aggregate([
      { $match: { status: { $in: ['success', 'refunded'] } } },
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: '$amount' },
          totalRefunds: { $sum: '$refundAmount' },
        },
      },
    ]);

    const grossRevenue = successfulPayments[0]?.grossRevenue || 0;
    const totalRefunds = successfulPayments[0]?.totalRefunds || 0;
    const netRevenue = grossRevenue - totalRefunds;

    // 5. Current Occupancy Percentage for Today
    const todayString = today.toISOString().slice(0, 10);
    const todayOccupiedNights = await RoomOccupancy.countDocuments({
      night: todayString,
      status: 'confirmed',
    });

    const occupancyRate = totalRoomsCount > 0
      ? Math.round((todayOccupiedNights / totalRoomsCount) * 100)
      : 0;

    return {
      kpis: {
        totalRooms: totalRoomsCount,
        availableRooms: availableRoomsCount,
        maintenanceRooms: maintenanceRoomsCount,
        todayOccupiedRooms: todayOccupiedNights,
        occupancyRate: `${occupancyRate}%`,
        occupancyRateNumber: occupancyRate,
        totalBookings,
        confirmedBookings,
        activeStays: checkedInBookings,
        completedStays: checkedOutBookings,
        cancelledBookings,
        grossRevenue,
        totalRefunds,
        netRevenue,
        currency: 'INR',
      },
      todayArrivals,
      todayDepartures,
    };
  }

  /**
   * Occupancy Analysis over a date range
   */
  static async getOccupancyReport(startDateInput, endDateInput) {
    const start = startDateInput ? new Date(startDateInput) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDateInput ? new Date(endDateInput) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const totalRooms = await Room.countDocuments({ status: { $ne: 'inactive' } });

    // Aggregate occupancies grouped by night
    const occupancies = await RoomOccupancy.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
          status: 'confirmed',
        },
      },
      {
        $group: {
          _id: '$night',
          occupiedRooms: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedTrend = occupancies.map((item) => ({
      date: item._id,
      occupiedRooms: item.occupiedRooms,
      totalRooms,
      occupancyPercentage: totalRooms > 0 ? Math.round((item.occupiedRooms / totalRooms) * 100) : 0,
    }));

    return {
      totalRooms,
      trend: formattedTrend,
    };
  }

  /**
   * Monthly Revenue Analysis
   */
  static async getRevenueReport() {
    const revenueByMonth = await Payment.aggregate([
      { $match: { status: { $in: ['success', 'refunded'] } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          refunds: { $sum: '$refundAmount' },
          transactionsCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const formattedRevenue = revenueByMonth.map((item) => {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      return {
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        grossRevenue: item.revenue,
        refunds: item.refunds,
        netRevenue: item.revenue - item.refunds,
        transactions: item.transactionsCount,
      };
    });

    return formattedRevenue;
  }
}

module.exports = ReportService;
