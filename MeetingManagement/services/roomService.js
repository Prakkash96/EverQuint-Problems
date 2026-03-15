const {
  createRoom,
  listRooms,
} = require('../repositories/roomRepository');

function createRoomService(input) {
  if (!input || typeof input.name !== 'string' || !input.name.trim()) {
    const err = new Error('name is required');
    err.statusCode = 400;
    throw err;
  }
  if (!Number.isInteger(input.capacity) || input.capacity < 1) {
    const err = new Error('capacity must be an integer >= 1');
    err.statusCode = 400;
    throw err;
  }
  if (!Number.isInteger(input.floor)) {
    const err = new Error('floor must be an integer');
    err.statusCode = 400;
    throw err;
  }

  const amenities = Array.isArray(input.amenities) ? input.amenities : [];
  return createRoom({
    name: input.name.trim(),
    capacity: input.capacity,
    floor: input.floor,
    amenities,
  });
}

function listRoomsService(filters) {
  const minCapacity =
    filters.minCapacity != null ? Number(filters.minCapacity) : undefined;
  if (
    minCapacity != null &&
    (!Number.isInteger(minCapacity) || minCapacity < 1)
  ) {
    const err = new Error('minCapacity must be a positive integer');
    err.statusCode = 400;
    throw err;
  }
  return listRooms({
    minCapacity,
    amenity: filters.amenity,
  });
}

module.exports = {
  createRoomService,
  listRoomsService,
};

