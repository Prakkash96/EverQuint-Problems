const { createBookingService, listBookingsService, cancelBookingService, roomUtilizationService } = require('../services/bookingService');

const createBooking = (req, res, next) => {
  try {
    const idempotencyKey = req.header('Idempotency-Key');
    const booking = createBookingService({
      ...(req.body || {}),
      idempotencyKey,
    });
    res.status(201).json({ ...booking, status: 'confirmed' });
  } catch (err) {
    next(err);
  }
};

const listBookings = (req, res, next) => {
  try {
    const { items, total } = listBookingsService(req.query || {});
    const limit =
      req.query.limit != null ? Number(req.query.limit) || 50 : 50;
    const offset =
      req.query.offset != null ? Number(req.query.offset) || 0 : 0;
    res.json({ items, total, limit, offset });
  } catch (err) {
    next(err);
  }
};

const cancelBooking = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      const e = new Error('id must be an integer');
      e.statusCode = 400;
      throw e;
    }
    const booking = cancelBookingService(id, new Date());
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

const roomUtilizationReport = (req, res, next) => {
  try {
    const data = roomUtilizationService({
      from: req.query.from,
      to: req.query.to,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  listBookings,
  cancelBooking,
  roomUtilizationReport,
};

