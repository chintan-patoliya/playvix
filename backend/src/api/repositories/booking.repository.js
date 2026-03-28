const { Booking, Slot, Pitch, User } = require('../models');
const { sequelize } = require('../../config/database');
const { Op } = require('sequelize');
const { logger } = require('../../config/logger');
const MESSAGES = require('../../constants/messages');

const findByUser = (userId) =>
  Booking.findAll({
    where: { userId },
    include: [
      {
        model: Slot,
        as: 'slot',
        attributes: ['id', 'startTime', 'endTime'],
      },
      {
        model: Pitch,
        as: 'pitch',
        attributes: ['id', 'name', 'location', 'pricePerHour'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

const findByPitchSlotDate = (pitchId, slotId, bookingDate) =>
  Booking.findOne({
    where: {
      pitchId,
      slotId,
      bookingDate,
      status: { [Op.in]: ['confirmed'] },
    },
  });

const createWithLock = async ({ userId, pitchId, slotId, bookingDate, status }) => {
  return sequelize.transaction(async (t) => {
    const existing = await Booking.findOne({
      where: {
        pitchId,
        slotId,
        bookingDate,
        status: { [Op.in]: ['confirmed'] },
      },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (existing) {
      const err = new Error(MESSAGES.BOOKING.ALREADY_BOOKED);
      err.status = 409;
      throw err;
    }

    const booking = await Booking.create(
      { userId, pitchId, slotId, bookingDate, status },
      { transaction: t },
    );

    logger.info(`[BookingRepo] Created booking id=${booking.id} user=${userId} slot=${slotId} date=${bookingDate}`);
    return booking;
  });
};

const findById = (id) =>
  Booking.findByPk(id, {
    include: [
      { model: Slot, as: 'slot', attributes: ['id', 'startTime', 'endTime'] },
      { model: Pitch, as: 'pitch', attributes: ['id', 'name', 'location', 'pricePerHour'] },
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
    ],
  });

const updateStatus = (id, status) =>
  Booking.update({ status }, { where: { id } });

const cancelBooking = (id) =>
  Booking.update({ status: 'cancelled' }, { where: { id } });

module.exports = { findByUser, findByPitchSlotDate, createWithLock, findById, updateStatus, cancelBooking };
