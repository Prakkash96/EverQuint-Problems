const memoryStore = {
  rooms: [],
  bookings: [],
  idempotencyRecords: [],
  roomSeq: 1,
  bookingSeq: 1,
  reset() {
    this.rooms = [];
    this.bookings = [];
    this.idempotencyRecords = [];
    this.roomSeq = 1;
    this.bookingSeq = 1;
  },
  nextRoomId() {
    return this.roomSeq++;
  },
  nextBookingId() {
    return this.bookingSeq++;
  },
};

module.exports = { memoryStore };

