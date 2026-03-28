const User = require('./user.model');
const Pitch = require('./pitch.model');
const Slot = require('./slot.model');
const Booking = require('./booking.model');

Pitch.hasMany(Slot, { foreignKey: 'pitchId', as: 'slots' });
Slot.belongsTo(Pitch, { foreignKey: 'pitchId', as: 'pitch' });

Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Booking.belongsTo(Pitch, { foreignKey: 'pitchId', as: 'pitch' });
Booking.belongsTo(Slot, { foreignKey: 'slotId', as: 'slot' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });

module.exports = { User, Pitch, Slot, Booking };
