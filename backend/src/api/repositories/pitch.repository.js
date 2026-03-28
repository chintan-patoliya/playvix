const { Pitch, Slot } = require('../models');

const findAll = () =>
  Pitch.findAll({ order: [['id', 'ASC']] });

const findById = (id) =>
  Pitch.findByPk(id, {
    include: [{ model: Slot, as: 'slots', order: [['startTime', 'ASC']] }],
  });

module.exports = { findAll, findById };
