const express = require('express');
const { roomRouter } = require('../routes/roomRoutes');
const { bookingRouter } = require('../routes/bookingRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();

app.use(express.json());

app.use('/rooms', roomRouter);
app.use('/bookings', bookingRouter);

app.use(errorHandler);

module.exports = { app };

