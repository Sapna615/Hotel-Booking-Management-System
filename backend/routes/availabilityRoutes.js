const express = require('express');
const router = express.Router();
const AvailabilityController = require('../controllers/availabilityController');
const { validate, availabilityQuerySchema } = require('../validators/schemas');

router.get('/', validate(availabilityQuerySchema, 'query'), AvailabilityController.searchAvailability);
router.get('/room/:id', AvailabilityController.checkRoomAvailability);

module.exports = router;

