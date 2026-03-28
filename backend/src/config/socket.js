const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { frontendUrl } = require('./vars');
const { logger } = require('./logger');
const { createAdapterClients } = require('./redis');

let io = null;

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Enable Redis Adapter for multi-server scaling
  try {
    const { pubClient, subClient } = createAdapterClients();
    io.adapter(createAdapter(pubClient, subClient));
    logger.info('Socket.io Redis Adapter enabled for multi-server scaling');
  } catch (err) {
    logger.warn(`Redis Adapter not enabled: ${err.message} — Socket.io running in single-server mode`);
  }

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('join:pitch', (pitchId) => {
      socket.join(`pitch:${pitchId}`);
      logger.info(`Socket ${socket.id} joined room pitch:${pitchId}`);
    });

    socket.on('leave:pitch', (pitchId) => {
      socket.leave(`pitch:${pitchId}`);
      logger.info(`Socket ${socket.id} left room pitch:${pitchId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} — reason: ${reason}`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error on ${socket.id}:`, err.message);
    });
  });

  logger.info('Socket.io initialized');
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized. Call init(httpServer) first.');
  return io;
};

const emitToRoom = (room, event, data) => {
  try {
    getIO().to(room).emit(event, data);
  } catch (err) {
    logger.error(`Failed to emit ${event} to room ${room}:`, err.message);
  }
};

module.exports = { init, getIO, emitToRoom };
