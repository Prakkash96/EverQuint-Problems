const express = require('express');
const { createRoom, listRooms } = require('../controllers/roomController');

const router = express.Router();

router.post('/', createRoom);
router.get('/', listRooms);

module.exports = { roomRouter: router };

