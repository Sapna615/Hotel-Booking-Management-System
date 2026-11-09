const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    method: {
      type: String,
      enum: {
        values: ['credit_card', 'debit_card', 'upi', 'net_banking', 'simulated'],
        message: '{VALUE} is not a supported payment method',
      },
      default: 'simulated',
    },
    status: {
      type: String,
      enum: {
        values: ['success', 'failed', 'refunded'],
        message: '{VALUE} is not a valid payment status',
      },
      required: true,
      index: true,
    },
    transactionReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    idempotencyKey: {
      type: String,
      index: true,
      sparse: true,
    },
    failureReason: {
      type: String,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReference: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
