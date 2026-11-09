const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const ApiResponse = require('../utils/apiResponse');
const { recordAuditLog } = require('../utils/auditLogger');

class AdminController {
  // Get all registered users (Admin only)
  static async getAllUsers(req, res, next) {
    try {
      const { role, search, page = 1, limit = 20 } = req.query;
      const query = {};
      if (role) query.role = role;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const [users, total] = await Promise.all([
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        User.countDocuments(query),
      ]);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Users retrieved',
        data: users,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Update user role or status (Admin only)
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { role, isActive } = req.body;

      const user = await User.findById(id);
      if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
      }

      // Prevent self-deactivation or demotion for primary admin safety
      if (user._id.toString() === req.user._id.toString() && (role !== 'admin' || isActive === false)) {
        const err = new Error('You cannot demote or deactivate your own admin account');
        err.statusCode = 400;
        throw err;
      }

      const previous = { role: user.role, isActive: user.isActive };

      if (role !== undefined) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
      await user.save();

      await recordAuditLog(req, {
        action: 'USER_ROLE_OR_STATUS_UPDATED',
        entityType: 'User',
        entityId: user._id,
        details: { previous, updated: { role: user.role, isActive: user.isActive } },
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'User updated successfully',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  // Get audit logs (Admin only)
  static async getAuditLogs(req, res, next) {
    try {
      const { action, entityType, page = 1, limit = 50 } = req.query;
      const query = {};
      if (action) query.action = action;
      if (entityType) query.entityType = entityType;

      const skip = (Number(page) - 1) * Number(limit);
      const [logs, total] = await Promise.all([
        AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        AuditLog.countDocuments(query),
      ]);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Audit logs retrieved',
        data: logs,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AdminController;
