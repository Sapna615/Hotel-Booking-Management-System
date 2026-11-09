/**
 * Standardized API Response Helper
 */
class ApiResponse {
  static success(res, { statusCode = 200, message = 'Success', data = null, meta = null }) {
    const payload = {
      success: true,
      message,
      data,
    };
    if (meta) {
      payload.meta = meta;
    }
    return res.status(statusCode).json(payload);
  }

  static error(res, { statusCode = 500, message = 'An unexpected error occurred', errors = null, code = null }) {
    const payload = {
      success: false,
      message,
    };
    if (errors) {
      payload.errors = errors;
    }
    if (code) {
      payload.code = code;
    }
    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;

