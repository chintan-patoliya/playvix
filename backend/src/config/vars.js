const path = require('path');
const {
  BOOKING_STATUS,
  SLOT_STATUS,
  ROLES,
  RESERVATION_TTL_SECONDS,
  RESERVATION_KEY_PREFIX,
} = require('../constants');

require('dotenv-safe').config({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
  allowEmptyValues: true,
});

module.exports = {
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY || '7d',
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  maxRequests: parseInt(process.env.MAX_REQUESTS, 10) || 100,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME || 'playvix',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  reservation: {
    ttlSeconds: RESERVATION_TTL_SECONDS,
    keyPrefix: RESERVATION_KEY_PREFIX,
  },
  roles: {
    user: ROLES.USER,
    admin: ROLES.ADMIN,
  },
  bookingStatus: {
    pending: BOOKING_STATUS.PENDING,
    confirmed: BOOKING_STATUS.CONFIRMED,
    cancelled: BOOKING_STATUS.CANCELLED,
    expired: BOOKING_STATUS.EXPIRED,
  },
  slotStatus: {
    available: SLOT_STATUS.AVAILABLE,
    reserved: SLOT_STATUS.RESERVED,
    booked: SLOT_STATUS.BOOKED,
  },
};
