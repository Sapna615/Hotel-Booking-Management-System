const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./docs/swagger.json');

const errorHandler = require('./middleware/errorHandler');
const ApiResponse = require('./utils/apiResponse');

// Route imports
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5001',
  'https://hotel-booking-management-system-flax.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Swagger, server-to-server)
      // or if origin is in the allowed list or is a Vercel preview deployment
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for public API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api/', apiLimiter);

// Health check endpoints (both /api/health and /health)
const healthHandler = (req, res) => {
  return ApiResponse.success(res, {
    message: 'Hotel Booking Management System API is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      status: 'UP',
    },
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Swagger Interactive API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Mount Application Routes under /api
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Resilient fallback mounts directly at root (in case client omits /api prefix)
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);
app.use('/availability', availabilityRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);
app.use('/reports', reportRoutes);
app.use('/admin', adminRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  return ApiResponse.error(res, {
    statusCode: 404,
    message: `API endpoint '${req.originalUrl}' not found`,
    code: 'NOT_FOUND',
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;

