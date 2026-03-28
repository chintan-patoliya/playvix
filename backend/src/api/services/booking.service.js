const httpStatus = require('http-status');
const BookingRepository = require('../repositories/booking.repository');
const ReservationService = require('./reservation.service');
const { throwIfNotFound, throwIfNotOwner, throwIfInvalidStatus, throwConflictError, throwGoneError } = require('../utils/errorHelper');
const { emitToRoom } = require('../../config/socket');
const { getRedis } = require('../../config/redis');
const { logger } = require('../../config/logger');
const MESSAGES = require('../../constants/messages');
const { IDEMPOTENCY_TTL_SECONDS, CANCELLABLE_STATUSES } = require('../../constants');

const reserveSlot = async ({ userId, pitchId, slotId, bookingDate }) => {
  const result = await ReservationService.reserveSlot(pitchId, slotId, bookingDate, userId);

  if (!result.success) {
    throwConflictError(MESSAGES.BOOKING.SLOT_HELD(result.ttl));
  }

  emitToRoom(`pitch:${pitchId}`, 'slot:reserved', {
    slotId,
    pitchId,
    date: bookingDate,
    status: 'reserved',
    ttl: result.ttl,
  });

  return { reserved: true, ttl: result.ttl, expiresIn: result.ttl };
};

const confirmBooking = async ({ userId, pitchId, slotId, bookingDate, idempotencyKey }) => {
  // Idempotency check — if same key was already processed, return cached result
  if (idempotencyKey) {
    const redis = getRedis();
    if (redis) {
      const cached = await redis.get(`idempotency:${idempotencyKey}`);
      if (cached) {
        logger.info(`[BookingService] Idempotency hit for key=${idempotencyKey}`);
        return JSON.parse(cached);
      }
    }
  }

  const reservation = await ReservationService.getReservation(pitchId, slotId, bookingDate);

  throwIfNotFound(reservation, MESSAGES.BOOKING.RESERVATION_EXPIRED);
  throwIfNotOwner(parseInt(reservation.userId, 10), userId, MESSAGES.BOOKING.SLOT_HELD_OTHER);

  const booking = await BookingRepository.createWithLock({
    userId,
    pitchId,
    slotId,
    bookingDate,
    status: 'confirmed',
  });

  // Release reservation
  await ReservationService.releaseSlot(pitchId, slotId, bookingDate, userId);

  // Broadcast update
  emitToRoom(`pitch:${pitchId}`, 'slot:booked', {
    slotId,
    pitchId,
    date: bookingDate,
    status: 'booked',
  });

  return booking;
};

const getMyBookings = async (userId) => {
  return BookingRepository.findByUser(userId);
};

const getBookingById = async (id) => {
  const booking = await BookingRepository.findById(id);
  throwIfNotFound(booking, MESSAGES.BOOKING.NOT_FOUND);
  return booking;
};

const cancelBooking = async ({ userId, bookingId }) => {
  const booking = await BookingRepository.findById(bookingId);
  throwIfNotFound(booking, MESSAGES.BOOKING.NOT_FOUND);
  throwIfNotOwner(booking.userId, userId, MESSAGES.BOOKING.NOT_OWNER);
  throwIfInvalidStatus(booking.status, CANCELLABLE_STATUSES, MESSAGES.BOOKING.CANNOT_CANCEL);
  
  await BookingRepository.cancelBooking(bookingId);
  const updated = await BookingRepository.findById(bookingId);

  // Broadcast update
  emitToRoom(`pitch:${updated.pitchId}`, 'slot:available', {
    slotId: updated.slotId,
    pitchId: updated.pitchId,
    date: updated.bookingDate,
    status: 'available',
  });

  return updated;
};

module.exports = { reserveSlot, confirmBooking, getMyBookings, getBookingById, cancelBooking };
