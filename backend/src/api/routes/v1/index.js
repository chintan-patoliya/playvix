const express = require('express');
const authRoutes = require('./auth.route');
const pitchRoutes = require('./pitch.route');
const slotRoutes = require('./slot.route');
const bookingRoutes = require('./booking.route');

const router = express.Router();

/**
 * @api {get} v1/health Health Check
 * @apiDescription Check API health status
 * @apiVersion 1.0.0
 * @apiName HealthCheck
 * @apiGroup System
 * @apiPermission public
 *
 * @apiSuccess (OK 200) {String}  status    Service status (ok)
 * @apiSuccess (OK 200) {String}  timestamp Current server timestamp
 */
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

/**
 * @api {get} v1 API Information
 * @apiDescription Get API version and available routes
 * @apiVersion 1.0.0
 * @apiName ApiInfo
 * @apiGroup System
 * @apiPermission public
 *
 * @apiSuccess (OK 200) {String}  version     API version
 * @apiSuccess (OK 200) {String}  name        API name
 * @apiSuccess (OK 200) {String}  description API description
 * @apiSuccess (OK 200) {Object}  routes      Available route groups
 */
router.get('/', (req, res) => res.json({
  version: '1.0.0',
  name: 'PlayVix Cricket Booking API',
  description: 'API for cricket pitch booking system',
  routes: {
    auth: '/v1/auth - Authentication endpoints',
    pitches: '/v1/pitches - Cricket pitch management',
    slots: '/v1/slots - Time slot management',
    bookings: '/v1/bookings - Booking management',
  }
}));

router.use('/auth', authRoutes);
router.use('/pitches', pitchRoutes);
router.use('/slots', slotRoutes);
router.use('/bookings', bookingRoutes);

module.exports = router;
