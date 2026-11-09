const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/simulate', authenticate, PaymentController.simulatePayment);
router.get('/booking/:bookingId', authenticate, PaymentController.getPaymentsByBookingId);

module.exports = router;
