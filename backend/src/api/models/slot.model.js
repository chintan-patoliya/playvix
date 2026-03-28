const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Slot = sequelize.define('Slot', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  pitchId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'pitch_id',
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'start_time',
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'end_time',
  },
}, {
  tableName: 'slots',
  underscored: true,
  timestamps: false,
});

module.exports = Slot;
