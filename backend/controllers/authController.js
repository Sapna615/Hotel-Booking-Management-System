const AuthService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const { recordAuditLog } = require('../utils/auditLogger');

class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;
      const { user, token } = await AuthService.register({ name, email, password, phone });

      await recordAuditLog(req, {
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: user._id,
        details: { email: user.email, role: user.role },
        actor: user,
      });

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Account created successfully',
        data: { user, token },
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login({ email, password });

      await recordAuditLog(req, {
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: user._id,
        details: { email: user.email, role: user.role },
        actor: user,
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Login successful',
        data: { user, token },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user._id);
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Current user profile retrieved',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res) {
    // JWT is stateless; client removes token. We provide standard success response.
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Logged out successfully',
    });
  }
}

module.exports = AuthController;
