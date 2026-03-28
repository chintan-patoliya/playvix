const express = require('express');
const { validate } = require('express-validation');
const bookingController = require('../../controllers/booking.controller');
const bookingValidation = require('../../validations/booking.validation');
const { authorize } = require('../../middlewares/auth');

const router = express.Router();

/**
 * @api {post} v1/bookings/reserve-slot Reserve Slot
 * @apiDescription Reserve a time slot temporarily (2-minute window)
 * @apiVersion 1.0.0
 * @apiName ReserveSlot
 * @apiGroup Booking
 * @apiPermission user, admin
 *
 * @apiHeader {String} Authorization   User's access token
 *
 * @apiParam  {Number}  pitchId      Pitch ID
 * @apiParam  {Number}  slotId       Slot ID
 * @apiParam  {String}  bookingDate  Booking date (YYYY-MM-DD format)
 *
 * @apiSuccess (OK 200) {Object}  response       Response object
 * @apiSuccess (OK 200) {Boolean} response.success  Reservation success status
 * @apiSuccess (OK 200) {Number}  response.ttl     Time to live in seconds
 *
 * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
 * @apiError (Conflict 409)     SlotHeld         Slot is temporarily held by another user
 * @apiError (Unauthorized 401) Unauthorized     Invalid or missing token
 */
router.post(
  '/reserve-slot',
  authorize('user', 'admin'),
  validate(bookingValidation.reserveSlot, {}, {}),
  bookingController.reserveSlot,
);

/**
 * @api {post} v1/bookings/confirm-booking Confirm Booking
 * @apiDescription Confirm a previously reserved slot and create booking
 * @apiVersion 1.0.0
 * @apiName ConfirmBooking
 * @apiGroup Booking
 * @apiPermission user, admin
 *
 * @apiHeader {String} Authorization   User's access token
 *
 * @apiParam  {Number}  pitchId        Pitch ID
 * @apiParam  {Number}  slotId         Slot ID
 * @apiParam  {String}  bookingDate    Booking date (YYYY-MM-DD format)
 * @apiParam  {String}  idempotencyKey  Unique key for preventing duplicate bookings
 *
 * @apiSuccess (Created 201) {Object}  booking           Created booking object
 * @apiSuccess (Created 201) {Number}  booking.id        Booking ID
 * @apiSuccess (Created 201) {Number}  booking.pitchId   Pitch ID
 * @apiSuccess (Created 201) {Number}  booking.slotId    Slot ID
 * @apiSuccess (Created 201) {String}  booking.status    Booking status (confirmed)
 * @apiSuccess (Created 201) {String}  booking.bookingDate  Booking date
 * @apiSuccess (Created 201) {Number}  booking.userId     User ID
 * @apiSuccess (Created 201) {Date}    booking.createdAt  Creation timestamp
 *
 * @apiError (Bad Request 400)   ValidationError     Some parameters may contain invalid values
 * @apiError (Gone 410)         ReservationExpired  Reservation has expired
 * @apiError (Conflict 409)     SlotHeldOther       Slot is held by another user
 * @apiError (Unauthorized 401) Unauthorized         Invalid or missing token
 */
router.post(
  '/confirm-booking',
  authorize('user', 'admin'),
  validate(bookingValidation.confirmBooking, {}, {}),
  bookingController.confirmBooking,
);

/**
 * @api {get} v1/bookings/my-bookings Get My Bookings
 * @apiDescription Get all bookings for the current authenticated user
 * @apiVersion 1.0.0
 * @apiName GetMyBookings
 * @apiGroup Booking
 * @apiPermission user, admin
 *
 * @apiHeader {String} Authorization   User's access token
 *
 * @apiSuccess (OK 200) {Object[]}  bookings              Array of bookings
 * @apiSuccess (OK 200) {Number}    bookings[].id         Booking ID
 * @apiSuccess (OK 200) {Number}    bookings[].pitchId    Pitch ID
 * @apiSuccess (OK 200) {Number}    bookings[].slotId     Slot ID
 * @apiSuccess (OK 200) {String}    bookings[].status     Booking status
 * @apiSuccess (OK 200) {String}    bookings[].bookingDate Booking date
 * @apiSuccess (OK 200) {Number}    bookings[].userId     User ID
 * @apiSuccess (OK 200) {Date}      bookings[].createdAt  Creation timestamp
 * @apiSuccess (OK 200) {Object}    bookings[].pitch      Pitch details
 * @apiSuccess (OK 200) {Object}    bookings[].slot       Slot details
 *
 * @apiError (Unauthorized 401)  Unauthorized  Invalid or missing token
 */
router.get('/my-bookings', authorize('user', 'admin'), bookingController.getMyBookings);

/**
 * @api {get} v1/bookings/:id Get Booking by ID
 * @apiDescription Get a specific booking by ID (user can only access their own bookings)
 * @apiVersion 1.0.0
 * @apiName GetBookingById
 * @apiGroup Booking
 * @apiPermission user, admin
 *
 * @apiHeader {String} Authorization   User's access token
 *
 * @apiParam  {Number}  id  Booking ID
 *
 * @apiSuccess (OK 200) {Object}  booking           Booking object
 * @apiSuccess (OK 200) {Number}  booking.id        Booking ID
 * @apiSuccess (OK 200) {Number}  booking.pitchId   Pitch ID
 * @apiSuccess (OK 200) {Number}  booking.slotId    Slot ID
 * @apiSuccess (OK 200) {String}  booking.status    Booking status
 * @apiSuccess (OK 200) {String}  booking.bookingDate  Booking date
 * @apiSuccess (OK 200) {Number}  booking.userId     User ID
 * @apiSuccess (OK 200) {Date}    booking.createdAt  Creation timestamp
 * @apiSuccess (OK 200) {Object}  booking.pitch      Pitch details
 * @apiSuccess (OK 200) {Object}  booking.slot       Slot details
 *
 * @apiError (Bad Request 400)  ValidationError  Invalid booking ID
 * @apiError (NotFound 404)     NotFound        Booking not found
 * @apiError (Unauthorized 401) Unauthorized     Invalid or missing token
 * @apiError (Forbidden 403)   Forbidden        Access denied to this booking
 */
router.get('/:id', authorize('user', 'admin'), validate(bookingValidation.getBookingById, {}, {}), bookingController.getBookingById);

/**
 * @api {patch} v1/bookings/:id/cancel Cancel Booking
 * @apiDescription Cancel a booking (only confirmed or pending bookings can be cancelled)
 * @apiVersion 1.0.0
 * @apiName CancelBooking
 * @apiGroup Booking
 * @apiPermission user, admin
 *
 * @apiHeader {String} Authorization   User's access token
 *
 * @apiParam  {Number}  id  Booking ID
 *
 * @apiSuccess (OK 200) {Object}  booking           Updated booking object
 * @apiSuccess (OK 200) {Number}  booking.id        Booking ID
 * @apiSuccess (OK 200) {Number}  booking.pitchId   Pitch ID
 * @apiSuccess (OK 200) {Number}  booking.slotId    Slot ID
 * @apiSuccess (OK 200) {String}  booking.status    Booking status (cancelled)
 * @apiSuccess (OK 200) {String}  booking.bookingDate  Booking date
 * @apiSuccess (OK 200) {Number}  booking.userId     User ID
 * @apiSuccess (OK 200) {Date}    booking.createdAt  Creation timestamp
 * @apiSuccess (OK 200) {String}  message           Success message
 *
 * @apiError (Bad Request 400)  ValidationError     Invalid booking ID
 * @apiError (NotFound 404)     NotFound           Booking not found
 * @apiError (Forbidden 403)   Forbidden          Access denied to this booking
 * @apiError (BadRequest 400) CannotCancel       Booking cannot be cancelled (already cancelled/expired)
 * @apiError (Unauthorized 401) Unauthorized       Invalid or missing token
 */
router.patch('/:id/cancel', authorize('user', 'admin'), validate(bookingValidation.cancelBooking, {}, {}), bookingController.cancelBooking);

module.exports = router;
