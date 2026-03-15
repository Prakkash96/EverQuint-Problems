const { createBooking, findOverlappingBooking, listBookings, getBookingById, cancelBooking, createBookingWithIdempotency, getBookingsForUtilization } = require('../repositories/bookingRepository');
const { getRoomById } = require('../repositories/roomRepository');
const { validateBookingWindow, validateBusinessHours, canCancelBooking, calculateUtilization } = require('../domain/bookingRules');

function createBookingService(input) {
  const roomId = Number(input.roomId);
  if (!Number.isInteger(roomId)) {
    const err = new Error('roomId must be an integer');
    err.statusCode = 400;
    throw err;
  }
  const room = getRoomById(roomId);
  if (!room) {
    const err = new Error('Room not found');
    err.statusCode = 404;
    throw err;
  }
  if (typeof input.title !== 'string' || !input.title.trim()) {
    const err = new Error('title is required');
    err.statusCode = 400;
    throw err;
  }
  if (typeof input.organizerEmail !== 'string' || !input.organizerEmail) {
    const err = new Error('organizerEmail is required');
    err.statusCode = 400;
    throw err;
  }
  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    const err = new Error('startTime and endTime must be ISO-8601 strings');
    err.statusCode = 400;
    throw err;
  }
  const idempotencyKey = input.idempotencyKey;
  if (idempotencyKey) {
    return createBookingWithIdempotency({
      key: idempotencyKey,
      organizerEmail: input.organizerEmail,
      booking: { roomId, title: input.title.trim(), startTime, endTime }
    });
  }

  validateBookingWindow(startTime, endTime);
  validateBusinessHours(startTime, endTime);

  const overlapping = findOverlappingBooking({ roomId, startTime, endTime });
  if (overlapping) {
    const err = new Error('Booking conflicts with existing booking');
    err.statusCode = 409;
    throw err;
  }

  return createBooking({ roomId, title: input.title.trim(), organizerEmail: input.organizerEmail, startTime, endTime });
}

function listBookingsService(query) {
  const roomId = query.roomId != null && query.roomId !== '' ? Number(query.roomId) : undefined;
  const from = query.from != null && query.from !== '' ? new Date(query.from) : undefined;
  const to = query.to != null && query.to !== '' ? new Date(query.to) : undefined;
  const limit = query.limit != null && query.limit !== '' ? Number(query.limit) : 50;
  const offset = query.offset != null && query.offset !== '' ? Number(query.offset) : 0;

  return listBookings({ roomId: Number.isInteger(roomId) ? roomId : undefined, from: from && !isNaN(from.getTime()) ? from : undefined, to: to && !isNaN(to.getTime()) ? to : undefined, limit, offset });
}

function cancelBookingService(id, now) {
  const booking = getBookingById(id);
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  if (booking.status === 'CANCELLED') {
    return booking;
  }
  canCancelBooking(booking.startTime, now);
  return cancelBooking(id);
}

function roomUtilizationService({ from, to }) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    const err = new Error('from and to must be ISO-8601 strings');
    err.statusCode = 400;
    throw err;
  }

  const bookings = getBookingsForUtilization({ from: fromDate, to: toDate });

  const byRoom = new Map();
  for (const b of bookings) {
    if (!b.room) continue;
    if (!byRoom.has(b.roomId)) {
      byRoom.set(b.roomId, {
        roomName: b.room.name,
        intervals: [],
      });
    }
    byRoom.get(b.roomId).intervals.push({
      start: b.startTime,
      end: b.endTime,
    });
  }

  const result = [];
  for (const [roomId, value] of byRoom.entries()) {
    const { totalBookingHours, utilizationPercent } = calculateUtilization(
      value.intervals,
      { from: fromDate, to: toDate },
    );
    result.push({ roomId, roomName: value.roomName, totalBookingHours, utilizationPercent });
  }

  return result;
}

module.exports = {
  createBookingService,
  listBookingsService,
  cancelBookingService,
  roomUtilizationService,
};

