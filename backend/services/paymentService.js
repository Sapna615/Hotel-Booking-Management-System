const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment');

class PaymentService {
  /**
   * Simulate a payment transaction
   */
  static async processPayment({
    bookingId,
    amount,
    currency = 'INR',
    method = 'simulated',
    shouldSucceed = true,
    idempotencyKey = null,
  }) {
    // Check idempotency: If key provided, check if payment already processed
    if (idempotencyKey) {
      const existingPayment = await Payment.findOne({ idempotencyKey });
      if (existingPayment) {
        return existingPayment;
      }
    }

    const transactionReference = `TXN-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    const payment = await Payment.create({
      bookingId,
      amount,
      currency,
      method,
      status: shouldSucceed ? 'success' : 'failed',
      transactionReference,
      idempotencyKey,
      failureReason: shouldSucceed ? null : 'Simulated payment rejection (insufficient funds or bank timeout)',
    });

    return payment;
  }

  /**
   * Simulate a refund on cancellation
   */
  static async processRefund({ bookingId, refundAmount, reason = 'Booking cancellation' }) {
    const payment = await Payment.findOne({ bookingId, status: 'success' });
    if (!payment) {
      return null;
    }

    const refundReference = `REF-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    payment.status = 'refunded';
    payment.refundAmount = refundAmount || payment.amount;
    payment.refundReference = refundReference;
    await payment.save();

    return payment;
  }

  static async getPaymentByBookingId(bookingId) {
    return Payment.find({ bookingId }).sort({ createdAt: -1 });
  }
}

module.exports = PaymentService;

