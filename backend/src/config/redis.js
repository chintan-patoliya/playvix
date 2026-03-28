const Redis = require('ioredis');
const { redis: redisCfg } = require('./vars');
const { logger } = require('./logger');

let client = null;
let subscriber = null;

const redisOpts = () => ({
  host: redisCfg.host,
  port: redisCfg.port,
  password: redisCfg.password || undefined,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 100, 1000);
  },
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  lazyConnect: true,
});

const connectRedis = async () => {
  client = new Redis(redisOpts());
  client.on('error', (err) => logger.warn(`Redis error: ${err.message}`));
  await client.connect();
  logger.info('Redis client connected successfully');

  // Enable keyspace notifications for expired keys (Ex = expired events)
  try {
    await client.config('SET', 'notify-keyspace-events', 'Ex');
    logger.info('Redis keyspace notifications enabled (Ex)');
  } catch (err) {
    logger.warn(`Could not enable keyspace notifications: ${err.message}`);
  }

  // Create a dedicated subscriber client for keyspace expired events
  subscriber = new Redis(redisOpts());
  subscriber.on('error', (err) => logger.warn(`Redis subscriber error: ${err.message}`));
  await subscriber.connect();

  // Subscribe to expired events on db 0
  await subscriber.subscribe('__keyevent@0__:expired');
  logger.info('Redis subscriber listening for key expiry events');
};

const getRedis = () => {
  if (!client || client.status !== 'ready') return null;
  return client;
};

const getSubscriber = () => subscriber;

/**
 * Create Redis clients for Socket.io Redis Adapter
 * These clients need enableOfflineQueue: true for the adapter to work properly
 */
const createAdapterClients = () => {
  const opts = {
    host: redisCfg.host,
    port: redisCfg.port,
    password: redisCfg.password || undefined,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 100, 1000);
    },
    maxRetriesPerRequest: 3,
    enableOfflineQueue: true, // Required for Redis Adapter
    lazyConnect: false,
  };

  const pubClient = new Redis(opts);
  const subClient = new Redis(opts);

  pubClient.on('error', (err) => logger.warn(`Redis pubClient error: ${err.message}`));
  subClient.on('error', (err) => logger.warn(`Redis subClient error: ${err.message}`));

  return { pubClient, subClient };
};

module.exports = { connectRedis, getRedis, getSubscriber, createAdapterClients };
