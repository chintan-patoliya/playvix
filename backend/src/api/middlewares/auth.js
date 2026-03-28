const httpStatus = require('http-status');
const passport = require('passport');
const APIError = require('../utils/APIError');
const { logger } = require('../../config/logger');

const handleJWT = (req, res, next, roles) => async (err, user, info) => {
  const error = err || info;

  if (error && error.name === 'TokenExpiredError') {
    error.message = 'Access token has expired. Please log in again.';
  }

  const apiError = new APIError({
    message: error ? error.message : 'Unauthorized — no valid token provided',
    status: httpStatus.UNAUTHORIZED,
  });

  try {
    if (error || !user) throw error || new Error('No user found');
    req.logIn(user, { session: false }, (loginErr) => {
      if (loginErr) return next(apiError);
    });
  } catch (e) {
    logger.warn(`[Auth] Unauthorized access attempt: ${req.method} ${req.originalUrl}`);
    return next(apiError);
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    logger.warn(`[Auth] Forbidden — user ${user.id} (role: ${user.role}) tried ${req.originalUrl}`);
    apiError.status = httpStatus.FORBIDDEN;
    apiError.message = 'Forbidden — insufficient permissions';
    return next(apiError);
  }

  req.user = user;
  return next();
};

const authorize = (...roles) => (req, res, next) =>
  passport.authenticate(
    'jwt',
    { session: false },
    handleJWT(req, res, next, roles),
  )(req, res, next);

module.exports = { authorize };
