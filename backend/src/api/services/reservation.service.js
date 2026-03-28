const { getRedis } = require('../../config/redis');
const { reservation: { ttlSeconds, keyPrefix } } = require('../../config/vars');
const { logger } = require('../../config/logger');
const MESSAGES = require('../../constants/messages');

const buildKey = (pitchId, slotId, date) =>
  `${keyPrefix}:${pitchId}:${slotId}:${date}`;

const reserveSlot = async (pitchId, slotId, date, userId) => {
  const redis = getRedis();
  if (!redis) throw new (require('../utils/APIError'))({ message: MESSAGES.RESERVATION.SERVICE_UNAVAILABLE, status: 503 });
  const key = buildKey(pitchId, slotId, date);

  const result = await redis.set(key, String(userId), 'EX', ttlSeconds, 'NX');

  if (result === null) {
    const existingUserId = await redis.get(key);
    if (existingUserId === String(userId)) {
      await redis.expire(key, ttlSeconds);
      logger.info(`[Reservation] Refreshed TTL for slot=${slotId} user=${userId}`);
      return { success: true, ttl: ttlSeconds };
    }
    const ttl = await redis.ttl(key);
    return { success: false, ttl };
  }

  logger.info(`[Reservation] Reserved slot=${slotId} pitch=${pitchId} date=${date} user=${userId} ttl=${ttlSeconds}s`);
  return { success: true, ttl: ttlSeconds };
};

const releaseSlot = async (pitchId, slotId, date, userId) => {
  const redis = getRedis();
  if (!redis) return false;
  const key = buildKey(pitchId, slotId, date);
  const existing = await redis.get(key);
  if (existing === String(userId)) {
    await redis.del(key);
    logger.info(`[Reservation] Released slot=${slotId} pitch=${pitchId} date=${date} user=${userId}`);
    return true;
  }
  return false;
};

const getReservation = async (pitchId, slotId, date) => {
  const redis = getRedis();
  if (!redis) return null;
  const key = buildKey(pitchId, slotId, date);
  const userId = await redis.get(key);
  if (!userId) return null;
  const ttl = await redis.ttl(key);
  return { userId, ttl };
};

const getReservedSlotIds = async (pitchId, date) => {
  const redis = getRedis();
  if (!redis) return [];
  const pattern = `${keyPrefix}:${pitchId}:*:${date}`;
  const keys = await redis.keys(pattern);
  return keys.map((k) => {
    const parts = k.split(':');
    return parseInt(parts[2], 10);
  });
};

module.exports = { reserveSlot, releaseSlot, getReservation, getReservedSlotIds };
