const { createRoomService, listRoomsService } = require('../services/roomService');

const createRoom = (req, res, next) => {
  try {
    const room = createRoomService(req.body || {});
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
};

const listRooms = (req, res, next) => {
  try {
    const rooms = listRoomsService(req.query || {});
    res.json(rooms);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRoom,
  listRooms,
};

