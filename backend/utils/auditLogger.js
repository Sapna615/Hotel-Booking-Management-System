const AuditLog = require('../models/AuditLog');

/**
 * Audit log helper function
 */
async function recordAuditLog(req, { action, entityType, entityId, details = {}, actor = null }) {
  try {
    const actorId = actor?.id || actor?._id || req?.user?._id || null;
    const actorName = actor?.name || req?.user?.name || 'System';
    const actorRole = actor?.role || req?.user?.role || 'system';
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1';

    await AuditLog.create({
      actorId,
      actorName,
      actorRole,
      action,
      entityType,
      entityId: String(entityId),
      details,
      ipAddress,
    });
  } catch (err) {
    // Non-blocking error handling for audit logs
    console.error(`[AuditLog Error] Failed to write audit log for ${action}:`, err.message);
  }
}

module.exports = {
  recordAuditLog,
};
