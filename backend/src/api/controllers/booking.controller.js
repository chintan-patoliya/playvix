const httpStatus = require('http-status');
const BookingService = require('../services/booking.service');
const MESSAGES = require('../../constants/messages');

exports.reserveSlot = async (req, res, next) => {
  try {
    const { slotId, pitchId, bookingDate } = req.body;
    const result = await BookingService.reserveSlot({
      userId: req.user.id,
      pitchId,
      slotId,
      bookingDate,
    });
    res.status(httpStatus.OK).json(result);
  } catch (err) {
    next(err);
  }
};

exports.confirmBooking = async (req, res, next) => {
  try {
    const { slotId, pitchId, bookingDate, idempotencyKey } = req.body;
    const booking = await BookingService.confirmBooking({
      userId: req.user.id,
      pitchId,
      slotId,
      bookingDate,
      idempotencyKey,
    });
    res.status(httpStatus.CREATED).json({ booking });
  } catch (err) {
    next(err);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await BookingService.getMyBookings(req.user.id);
    res.status(httpStatus.OK).json({ bookings });
  } catch (err) {
    next(err);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await BookingService.getBookingById(req.params.id);
    res.status(httpStatus.OK).json({ booking });
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await BookingService.cancelBooking({
      userId: req.user.id,
      bookingId: parseInt(req.params.id, 10),
    });
    res.status(httpStatus.OK).json({ booking, message: MESSAGES.BOOKING.CANCELLED });
  } catch (err) {
    next(err);
  }
};
