const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Pitch = sequelize.define('Pitch', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { 
      notEmpty: true, 
      len: [1, 100] 
    },
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { 
      notEmpty: true, 
      len: [1, 255] 
    },
  },
  pricePerHour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'price_per_hour',
    validate: { 
      min: 0,
      isDecimal: true
    },
  },
}, {
  tableName: 'pitches',
  underscored: true,
});

module.exports = Pitch;
