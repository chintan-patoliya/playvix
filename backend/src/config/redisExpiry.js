const { getSubscriber } = require('./redis');
const { emitToRoom } = require('./socket');
const { reservation: { keyPrefix } } = require('./vars');
const { logger } = require('./logger');

/**
 * Listens for Redis keyspace expired events.
 * When a slot_reservation key expires (TTL reached),
 * it broadcasts `slot:available` to all clients in the pitch room.
 *
 * Key format: slot_reservation:{pitchId}:{slotId}:{date}
 */
const initExpiryListener = () => {
  const subscriber = getSubscriber();
  if (!subscriber) {
    logger.warn('[RedisExpiry] Subscriber not available — expiry listener disabled');
    return;
  }

  subscriber.on('message', (channel, expiredKey) => {
    // Only handle our reservation keys
    if (!expiredKey.startsWith(keyPrefix + ':')) return;

    try {
      // Parse: slot_reservation:{pitchId}:{slotId}:{date}
      const parts = expiredKey.split(':');
      if (parts.length < 4) return;

      const pitchId = parseInt(parts[1], 10);
      const slotId = parseInt(parts[2], 10);
      const date = parts[3];

      if (isNaN(pitchId) || isNaN(slotId) || !date) return;

      logger.info(`[RedisExpiry] Key expired: ${expiredKey} → broadcasting slot:available for pitch=${pitchId} slot=${slotId} date=${date}`);

      // Broadcast to ALL clients watching this pitch
      emitToRoom(`pitch:${pitchId}`, 'slot:available', {
        slotId,
        pitchId,
        date,
        status: 'available',
      });
    } catch (err) {
      logger.error(`[RedisExpiry] Error handling expired key ${expiredKey}: ${err.message}`);
    }
  });

  logger.info('[RedisExpiry] Expiry listener initialized — slots will auto-release on TTL expiry');
};

module.exports = { initExpiryListener };
