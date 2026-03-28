const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { jwtSecret } = require('./vars');
const { logger } = require('./logger');

const jwtOptions = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
};

const jwt = async (payload, done) => {
  try {
    const UserRepository = require('../api/repositories/user.repository');
    const user = await UserRepository.findById(payload.sub);
    if (user) return done(null, user);
    return done(null, false);
  } catch (error) {
    logger.error('Passport JWT error:', error.message);
    return done(error, false);
  }
};

exports.jwt = new JwtStrategy(jwtOptions, jwt);
