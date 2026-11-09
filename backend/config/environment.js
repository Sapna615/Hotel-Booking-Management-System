const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_booking_db',
  JWT_SECRET: process.env.JWT_SECRET || 'hotel_booking_jwt_super_secret_key_algions_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  HOLD_EXPIRY_MINUTES: parseInt(process.env.HOLD_EXPIRY_MINUTES || '10', 10),
  TAX_RATE_PERCENT: 12,
  SERVICE_FEE_PERCENT: 5,
};
