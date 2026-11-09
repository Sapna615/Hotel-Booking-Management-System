const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/summary', authenticate, authorize('admin', 'staff'), ReportController.getSummary);
router.get('/occupancy', authenticate, authorize('admin', 'staff'), ReportController.getOccupancy);
router.get('/revenue', authenticate, authorize('admin'), ReportController.getRevenue);

module.exports = router;
