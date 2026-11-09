const mongoose = require('mongoose');

const roomOccupancySchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room ID is required'],
      index: true,
    },
    night: {
      type: String, // ISO date string 'YYYY-MM-DD' representing the calendar night
      required: [true, 'Night date (YYYY-MM-DD) is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Night must be in YYYY-MM-DD format'],
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['hold', 'confirmed'],
        message: '{VALUE} is not a valid occupancy status',
      },
      required: true,
      default: 'hold',
      index: true,
    },
    holdExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index on roomId + night ensures that no two active occupancies can ever exist for the same room on the same night
roomOccupancySchema.index({ roomId: 1, night: 1 }, { unique: true });

const RoomOccupancy = mongoose.model('RoomOccupancy', roomOccupancySchema);
module.exports = RoomOccupancy;

