const { memoryStore } = require('./memoryStore');

function createBooking(data) {
  const now = new Date();
  const booking = {
    id: memoryStore.nextBookingId(),
    roomId: data.roomId,
    title: data.title,
    organizerEmail: data.organizerEmail,
    startTime: data.startTime,
    endTime: data.endTime,
    status: 'CONFIRMED',
    createdAt: now,
    updatedAt: now,
  };
  memoryStore.bookings.push(booking);
  return booking;
}

function findOverlappingBooking({ roomId, startTime, endTime }) {
  return (
    memoryStore.bookings.find((b) => {
      if (b.roomId !== roomId) return false;
      if (b.status !== 'CONFIRMED') return false;
      const endsBeforeOrAtStart = b.endTime <= startTime;
      const startsAfterOrAtEnd = b.startTime >= endTime;
      return !(endsBeforeOrAtStart || startsAfterOrAtEnd);
    }) || null
  );
}

function listBookings({ roomId, from, to, limit, offset }) {
  let items = [...memoryStore.bookings];
  if (roomId != null) {
    items = items.filter((b) => b.roomId === roomId);
  }
  if (from) {
    items = items.filter((b) => b.endTime >= from);
  }
  if (to) {
    items = items.filter((b) => b.startTime <= to);
  }
  items.sort((a, b) => a.startTime - b.startTime);
  const total = items.length;
  items = items.slice(offset, offset + limit);
  return { items, total };
}

function getBookingById(id) {
  return memoryStore.bookings.find((b) => b.id === id) || null;
}

function cancelBooking(id) {
  const booking = memoryStore.bookings.find((b) => b.id === id);
  if (!booking) return null;
  booking.status = 'CANCELLED';
  booking.updatedAt = new Date();
  return booking;
}

function createBookingWithIdempotency({ key, organizerEmail, booking }) {
  const existingRecord = memoryStore.idempotencyRecords.find(
    (r) => r.key === key && r.organizerEmail === organizerEmail,
  );
  if (existingRecord) {
    const existingBooking = memoryStore.bookings.find(
      (b) => b.id === existingRecord.bookingId,
    );
    if (existingBooking) return existingBooking;
  }
  const created = createBooking({
    roomId: booking.roomId,
    title: booking.title,
    organizerEmail,
    startTime: booking.startTime,
    endTime: booking.endTime,
  });
  memoryStore.idempotencyRecords.push({
    key,
    organizerEmail,
    bookingId: created.id,
    createdAt: new Date(),
  });
  return created;
}

function getBookingsForUtilization({ from, to }) {
  const bookings = memoryStore.bookings.filter((b) => {
    if (b.status !== 'CONFIRMED') return false;
    const endsBeforeOrAtFrom = b.endTime <= from;
    const startsAfterOrAtTo = b.startTime >= to;
    return !(endsBeforeOrAtFrom || startsAfterOrAtTo);
  });
  return bookings.map((b) => ({
    ...b,
    room: memoryStore.rooms.find((r) => r.id === b.roomId),
  }));
}

module.exports = {
  createBooking,
  findOverlappingBooking,
  listBookings,
  getBookingById,
  cancelBooking,
  createBookingWithIdempotency,
  getBookingsForUtilization,
};

