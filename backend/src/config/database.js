const { Sequelize } = require('sequelize');
const { db } = require('./vars');
const { logger } = require('./logger');

const sequelize = new Sequelize(db.name, db.user, db.password, {
  host: db.host,
  port: db.port,
  dialect: 'mysql',
  logging: (msg) => logger.info(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    timestamps: true,
  },
});

const connectDB = async () => {
  await sequelize.authenticate();
  logger.info('MySQL database connection established successfully');
};

module.exports = { sequelize, connectDB };
