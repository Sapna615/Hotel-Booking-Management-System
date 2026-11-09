const ApiResponse = require('../utils/apiResponse');

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} roles Allowed roles ('admin', 'staff', 'guest')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: 'Authentication required before checking permissions',
        code: 'UNAUTHENTICATED',
      });
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(res, {
        statusCode: 403,
        message: `Forbidden: role '${req.user.role}' is not authorized to access this resource`,
        code: 'FORBIDDEN',
      });
    }

    next();
  };
};

module.exports = {
  authorize,
};
