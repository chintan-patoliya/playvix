const httpStatus = require('http-status');
const APIError = require('./APIError');

// Standardized error throwing helper
exports.throwNotFoundError = (message = 'Resource not found') => {
  throw new APIError({
    message,
    status: httpStatus.NOT_FOUND,
  });
};

exports.throwUnauthorizedError = (message = 'Unauthorized') => {
  throw new APIError({
    message,
    status: httpStatus.UNAUTHORIZED,
  });
};

exports.throwForbiddenError = (message = 'Forbidden') => {
  throw new APIError({
    message,
    status: httpStatus.FORBIDDEN,
  });
};

exports.throwConflictError = (message = 'Conflict') => {
  throw new APIError({
    message,
    status: httpStatus.CONFLICT,
  });
};

exports.throwBadRequestError = (message = 'Bad Request') => {
  throw new APIError({
    message,
    status: httpStatus.BAD_REQUEST,
  });
};

exports.throwGoneError = (message = 'Resource no longer available') => {
  throw new APIError({
    message,
    status: httpStatus.GONE,
  });
};

// Conditional error helpers
exports.throwIfNotFound = (resource, message) => {
  if (!resource) {
    exports.throwNotFoundError(message);
  }
};

exports.throwIfNotOwner = (resourceId, userId, message = 'You are not authorized to perform this action') => {
  if (resourceId !== userId) {
    exports.throwForbiddenError(message);
  }
};

exports.throwIfInvalidStatus = (status, validStatuses, message = 'Invalid status for this operation') => {
  if (!validStatuses.includes(status)) {
    exports.throwBadRequestError(message);
  }
};
