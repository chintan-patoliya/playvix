const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'user_id',
  },
  pitchId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'pitch_id',
  },
  slotId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'slot_id',
  },
  bookingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'booking_date',
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'expired'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'bookings',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['pitch_id', 'slot_id', 'booking_date'],
      name: 'uq_booking_pitch_slot_date',
    },
  ],
});

module.exports = Booking;
