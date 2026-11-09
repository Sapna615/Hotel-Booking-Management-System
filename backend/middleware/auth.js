const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

/**
 * Authentication Middleware
 * Validates JWT access token from Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'Authentication token missing or invalid',
        code: 'AUTH_TOKEN_MISSING',
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'User belonging to this token no longer exists',
        code: 'USER_NOT_FOUND',
      });
    }

    if (!user.isActive) {
      return ApiResponse.error(res, {
        statusCode: 403,
        message: 'Your user account has been deactivated',
        code: 'ACCOUNT_DEACTIVATED',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'Invalid authorization token',
        code: 'INVALID_TOKEN',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'Your authorization token has expired, please log in again',
        code: 'TOKEN_EXPIRED',
      });
    }
    return next(error);
  }
};

/**
 * Optional Authentication Middleware
 * If token is present, decode and attach user; if not, proceed without blocking
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (err) {
    // Silently ignore for optional auth
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuthenticate,
};
