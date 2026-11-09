const PaymentService = require('../services/paymentService');
const ApiResponse = require('../utils/apiResponse');

class PaymentController {
  static async getPaymentsByBookingId(req, res, next) {
    try {
      const { bookingId } = req.params;
      const payments = await PaymentService.getPaymentByBookingId(bookingId);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Payments retrieved',
        data: payments,
      });
    } catch (err) {
      next(err);
    }
  }

  static async simulatePayment(req, res, next) {
    try {
      const { bookingId, amount, currency, method, shouldSucceed, idempotencyKey } = req.body;
      const payment = await PaymentService.processPayment({
        bookingId,
        amount,
        currency,
        method,
        shouldSucceed: shouldSucceed !== false,
        idempotencyKey,
      });

      return ApiResponse.success(res, {
        statusCode: payment.status === 'success' ? 200 : 402,
        message: payment.status === 'success' ? 'Payment processed successfully' : 'Payment simulation failed',
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PaymentController;

