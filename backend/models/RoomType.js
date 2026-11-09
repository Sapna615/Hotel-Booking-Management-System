const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room type name is required'],
      unique: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price per night is required'],
      min: [0, 'Base price cannot be negative'],
    },
    capacity: {
      type: Number,
      required: [true, 'Guest capacity is required'],
      min: [1, 'Capacity must be at least 1 guest'],
      max: [10, 'Capacity cannot exceed 10 guests'],
    },
    amenities: {
      type: [String],
      default: ['High-speed Wi-Fi', 'Air Conditioning', 'En-suite Bathroom', 'Flat-screen TV'],
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const RoomType = mongoose.model('RoomType', roomTypeSchema);
module.exports = RoomType;

