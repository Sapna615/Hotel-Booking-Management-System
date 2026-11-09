const express = require('express');
const router = express.Router();
const RoomController = require('../controllers/roomController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  validate,
  roomTypeSchema,
  roomSchema,
  roomStatusUpdateSchema,
} = require('../validators/schemas');

// Room Types routes
router.get('/types', RoomController.getAllRoomTypes);
router.get('/types/:id', RoomController.getRoomTypeById);
router.post(
  '/types',
  authenticate,
  authorize('admin'),
  validate(roomTypeSchema),
  RoomController.createRoomType
);
router.put(
  '/types/:id',
  authenticate,
  authorize('admin'),
  validate(roomTypeSchema),
  RoomController.updateRoomType
);

// Individual Rooms routes
router.get('/', RoomController.getAllRooms);
router.get('/:id', RoomController.getRoomById);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(roomSchema),
  RoomController.createRoom
);
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(roomSchema),
  RoomController.updateRoom
);
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'staff'),
  validate(roomStatusUpdateSchema),
  RoomController.updateRoomStatus
);

module.exports = router;

