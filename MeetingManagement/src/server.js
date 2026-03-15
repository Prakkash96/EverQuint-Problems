const { app } = require('./app');
const { config } = require('../config/env');

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${config.port}`);
});

process.on('SIGTERM', () => {
  server.close();
});

process.on('SIGINT', () => {
  server.close();
});

module.exports = server;

