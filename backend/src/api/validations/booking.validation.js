const { Joi } = require('express-validation');

const getSlots = {
  query: Joi.object({
    pitchId: Joi.number().integer().positive().required(),
    date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({ 'string.pattern.base': 'date must be in YYYY-MM-DD format' }),
  }),
};

const reserveSlot = {
  body: Joi.object({
    slotId: Joi.number().integer().positive().required(),
    pitchId: Joi.number().integer().positive().required(),
    bookingDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .custom((value, helpers) => {
        const today = new Date().toISOString().split('T')[0];
        if (value < today) return helpers.error('date.past');
        return value;
      })
      .messages({
        'string.pattern.base': 'bookingDate must be in YYYY-MM-DD format',
        'date.past': 'bookingDate cannot be in the past',
      }),
  }),
};

const confirmBooking = {
  body: Joi.object({
    slotId: Joi.number().integer().positive().required(),
    pitchId: Joi.number().integer().positive().required(),
    bookingDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
    idempotencyKey: Joi.string().uuid().optional(),
  }),
};

const getBookingById = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

const cancelBooking = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

const getPitches = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};

module.exports = { 
  getSlots, 
  reserveSlot, 
  confirmBooking,
  getBookingById,
  cancelBooking,
  getPitches
};
