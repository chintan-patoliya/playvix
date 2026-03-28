const httpStatus = require('http-status');
const SlotService = require('../services/slot.service');

exports.getSlots = async (req, res, next) => {
  try {
    const { pitchId, date } = req.query;
    const slots = await SlotService.getSlotsWithStatus(parseInt(pitchId, 10), date);
    res.status(httpStatus.OK).json({ slots });
  } catch (err) {
    next(err);
  }
};
