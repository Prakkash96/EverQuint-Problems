const { addHours, addMinutes } = require('date-fns');

const MIN_DURATION_MINUTES = 15;
const MAX_DURATION_HOURS = 4;

function validationError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function validateBookingWindow(startTime, endTime) {
  if (!(startTime instanceof Date) || !(endTime instanceof Date)) {
    throw validationError('startTime and endTime must be dates');
  }
  if (!(startTime < endTime)) {
    throw validationError('startTime must be before endTime');
  }
  const minEnd = addMinutes(startTime, MIN_DURATION_MINUTES);
  const maxEnd = addHours(startTime, MAX_DURATION_HOURS);
  if (endTime < minEnd) {
    throw validationError('Booking duration must be at least 15 minutes');
  }
  if (endTime > maxEnd) {
    throw validationError('Booking duration must not exceed 4 hours');
  }
}

function validateBusinessHours(startTime, endTime) {
  const startDay = startTime.getDay();
  const endDay = endTime.getDay();
  if (startDay === 0 || startDay === 6 || endDay === 0 || endDay === 6) {
    throw validationError('Bookings are only allowed Monday to Friday');
  }
  const startHour = startTime.getHours();
  const startMinutes = startTime.getMinutes();
  const endHour = endTime.getHours();
  const endMinutes = endTime.getMinutes();
  const startOk = startHour > 8 || (startHour === 8 && startMinutes >= 0);
  const endOk = endHour < 20 || (endHour === 20 && endMinutes === 0);
  if (!startOk || !endOk) {
    throw validationError('Bookings must be within business hours 08:00–20:00');
  }
}

function canCancelBooking(startTime, now) {
  const cutoff = addHours(now, 1);
  if (!(now < startTime && cutoff <= startTime)) {
    throw validationError(
      'Booking can only be cancelled up to 1 hour before startTime',
    );
  }
}

function intersectIntervals(a, b) {
  const start = a.start > b.start ? a.start : b.start;
  const end = a.end < b.end ? a.end : b.end;
  if (start >= end) return null;
  return { start, end };
}

function calculateUtilization(bookedIntervals, range) {
  const businessIntervals = [];
  const cursor = new Date(range.from);
  while (cursor <= range.to) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      const start = new Date(cursor);
      start.setHours(8, 0, 0, 0);
      const end = new Date(cursor);
      end.setHours(20, 0, 0, 0);
      businessIntervals.push({ start, end });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  let totalBusinessMs = 0;
  for (const interval of businessIntervals) {
    const clipped = intersectIntervals(interval, {
      start: range.from,
      end: range.to,
    });
    if (clipped) {
      totalBusinessMs += clipped.end.getTime() - clipped.start.getTime();
    }
  }

  let totalBookedMs = 0;
  for (const booking of bookedIntervals) {
    const clippedBooking = intersectIntervals(booking, {
      start: range.from,
      end: range.to,
    });
    if (!clippedBooking) continue;
    for (const business of businessIntervals) {
      const intersected = intersectIntervals(clippedBooking, business);
      if (intersected) {
        totalBookedMs +=
          intersected.end.getTime() - intersected.start.getTime();
      }
    }
  }

  if (totalBusinessMs === 0) {
    return { totalBookingHours: 0, utilizationPercent: 0 };
  }
  const totalBookingHours = totalBookedMs / (1000 * 60 * 60);
  const utilizationPercent = totalBookedMs / totalBusinessMs;
  return { totalBookingHours, utilizationPercent };
}

module.exports = {
  validateBookingWindow,
  validateBusinessHours,
  canCancelBooking,
  calculateUtilization,
};

