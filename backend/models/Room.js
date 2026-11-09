const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    roomTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: [true, 'Room type is required'],
      index: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'maintenance', 'inactive'],
        message: '{VALUE} is not a valid room status',
      },
      default: 'available',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
