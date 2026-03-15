const { memoryStore } = require('./memoryStore');

function createRoom(data) {
  const existing = memoryStore.rooms.find(
    (r) => r.name.toLowerCase() === data.name.toLowerCase(),
  );
  if (existing) {
    const err = new Error('Room name must be unique');
    err.statusCode = 400;
    throw err;
  }
  const now = new Date();
  const room = {
    id: memoryStore.nextRoomId(),
    name: data.name,
    capacity: data.capacity,
    floor: data.floor,
    amenities: Array.isArray(data.amenities) ? data.amenities : [],
    createdAt: now,
    updatedAt: now,
  };
  memoryStore.rooms.push(room);
  return room;
}

function listRooms(filters) {
  let rooms = [...memoryStore.rooms];
  if (filters.minCapacity != null) {
    rooms = rooms.filter((r) => r.capacity >= filters.minCapacity);
  }
  if (filters.amenity) {
    const a = filters.amenity.toLowerCase();
    rooms = rooms.filter((r) =>
      r.amenities.some((am) => am.toLowerCase() === a),
    );
  }
  rooms.sort((a, b) => a.id - b.id);
  return rooms;
}

function getRoomById(id) {
  return memoryStore.rooms.find((r) => r.id === id) || null;
}

module.exports = {
  createRoom,
  listRooms,
  getRoomById,
};

