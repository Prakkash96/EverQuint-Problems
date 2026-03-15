const express = require('express');
const { createBooking, listBookings, cancelBooking, roomUtilizationReport } = require('../controllers/bookingController');

const router = express.Router();

router.post('/', createBooking);
router.get('/', listBookings);
router.post('/:id/cancel', cancelBooking);
router.get('/reports/room-utilization', roomUtilizationReport);

module.exports = { bookingRouter: router };

