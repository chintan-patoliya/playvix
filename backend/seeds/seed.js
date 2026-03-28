const path = require('path');
require('dotenv-safe').config({
  path: path.join(__dirname, '../.env'),
  sample: path.join(__dirname, '../.env.example'),
  allowEmptyValues: true,
});

const { sequelize } = require('../src/config/database');
const { Pitch, Slot } = require('../src/api/models');

const PITCHES = [
  { name: 'Turf Ground', location: 'Sector 12, Sports Complex', pricePerHour: 1500.00 },
  { name: 'Box Cricket', location: 'Mall Road, Indoor Arena', pricePerHour: 1000.00 },
  { name: 'Indoor Nets', location: 'Stadium Road, Training Center', pricePerHour: 800.00 },
  { name: 'Green Park Arena', location: 'Sector 22, Green Park', pricePerHour: 1800.00 },
  { name: 'Skyline Cricket Hub', location: 'MG Road, Skyline Tower', pricePerHour: 2000.00 },
  { name: 'Night Owl Pitch', location: 'Ring Road, Floodlit Complex', pricePerHour: 2200.00 },
  { name: 'The Pavilion', location: 'Civil Lines, Cricket Academy', pricePerHour: 1200.00 },
  { name: 'Astro Turf Zone', location: 'IT Park, Zone 5', pricePerHour: 1600.00 },
  { name: 'Champion Ground', location: 'University Road, Sports Hub', pricePerHour: 900.00 },
  { name: 'PowerPlay Arena', location: 'Outer Ring Road, PowerPlay Mall', pricePerHour: 2500.00 },
];

const generateSlots = (pitchId) => {
  const slots = [];
  for (let h = 6; h < 22; h++) {
    slots.push({
      pitchId,
      startTime: `${String(h).padStart(2, '0')}:00:00`,
      endTime: `${String(h + 1).padStart(2, '0')}:00:00`,
    });
  }
  return slots;
};

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database...');

    for (const pitchData of PITCHES) {
      const [pitch, created] = await Pitch.findOrCreate({
        where: { name: pitchData.name },
        defaults: pitchData,
      });
      if (created) {
        await Slot.bulkCreate(generateSlots(pitch.id));
        console.log(`✓ Seeded: ${pitch.name} (id=${pitch.id}) with 16 hourly slots`);
      } else {
        console.log(`→ Skipped: ${pitch.name} (already exists)`);
      }
    }

    console.log('\nSeeding complete!');
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
})();
