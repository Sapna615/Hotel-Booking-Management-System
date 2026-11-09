const ApiResponse = require('../utils/apiResponse');

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  let statusCode = err.statusCode || 500;

  // Log error in non-test environment
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Error Details]:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of '${err.value}'`;
    return ApiResponse.error(res, {
      statusCode: 404,
      message,
      code: 'RESOURCE_NOT_FOUND',
    });
  }

  // Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const fieldName = fields.join(', ');
    const message = `Duplicate value error: A record with that ${fieldName || 'unique field'} already exists`;
    return ApiResponse.error(res, {
      statusCode: 409,
      message,
      code: 'DUPLICATE_KEY_CONFLICT',
      errors: err.keyValue,
    });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Validation failed on database model',
      errors,
      code: 'VALIDATION_ERROR',
    });
  }

  // Express JSON parser SyntaxError
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Invalid JSON payload format in request body',
      code: 'MALFORMED_JSON',
    });
  }

  return ApiResponse.error(res, {
    statusCode,
    message: error.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_SERVER_ERROR',
  });
};

module.exports = errorHandler;

