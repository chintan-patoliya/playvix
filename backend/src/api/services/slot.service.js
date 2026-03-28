const SlotRepository = require('../repositories/slot.repository');
const ReservationService = require('./reservation.service');
const { slotStatus } = require('../../config/vars');

const getSlotsWithStatus = async (pitchId, date) => {
  const [slots, bookedSlotIds, reservedSlotIds] = await Promise.all([
    SlotRepository.findByPitch(pitchId),
    SlotRepository.findBookedSlotIds(pitchId, date),
    ReservationService.getReservedSlotIds(pitchId, date),
  ]);

  const bookedSet = new Set(bookedSlotIds);
  const reservedSet = new Set(reservedSlotIds);

  return slots.map((slot) => {
    let status = slotStatus.available;
    if (bookedSet.has(slot.id)) status = slotStatus.booked;
    else if (reservedSet.has(slot.id)) status = slotStatus.reserved;

    return {
      id: slot.id,
      pitchId: slot.pitchId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status,
    };
  });
};

module.exports = { getSlotsWithStatus };
