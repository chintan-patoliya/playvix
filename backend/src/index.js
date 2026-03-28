const { port, env } = require('./config/vars');
const { logger } = require('./config/logger');
const app = require('./config/express');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { init: initSocket } = require('./config/socket');
const { initExpiryListener } = require('./config/redisExpiry');
const http = require('http');

require('./api/models/index');

const server = http.createServer(app);

(async () => {
  try {
    await connectDB();
  } catch (err) {
    logger.error(`MySQL connection failed: ${err.message}`);
    process.exit(1);
  }

  try {
    await connectRedis();
  } catch (err) {
    logger.warn(`Redis unavailable (${err.message}) — reservation/lock features disabled. Start Redis to enable them.`);
  }

  initSocket(server);
  initExpiryListener();

  server.listen(port, () => {
    logger.info(`server started on port ${port} (${env})`);
  });
})();

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = app;
