const { Slot, Booking } = require('../models');
const { Op } = require('sequelize');

const findByPitch = (pitchId) =>
  Slot.findAll({
    where: { pitchId },
    order: [['startTime', 'ASC']],
  });

const findBookedSlotIds = async (pitchId, date) => {
  const rows = await Booking.findAll({
    where: {
      pitchId,
      bookingDate: date,
      status: { [Op.in]: ['confirmed'] },
    },
    attributes: ['slotId'],
  });
  return rows.map((r) => r.slotId);
};

module.exports = { findByPitch, findBookedSlotIds };
