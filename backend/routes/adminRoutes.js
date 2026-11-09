const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate, updateUserRoleSchema } = require('../validators/schemas');

router.use(authenticate, authorize('admin'));

router.get('/users', AdminController.getAllUsers);
router.patch('/users/:id', validate(updateUserRoleSchema), AdminController.updateUser);
router.get('/audit-logs', AdminController.getAuditLogs);

module.exports = router;
