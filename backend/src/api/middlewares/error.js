const httpStatus = require('http-status');
const expressValidation = require('express-validation');
const APIError = require('../utils/APIError');
const { logger } = require('../../config/logger');

const handler = (err, req, res, next) => {
  let response = {
    success: false,
    error: {
      message: err.errors && err.errors[0] && err.errors[0].messages
        ? err.errors[0].messages[0].replace(/"/g, '')
        : err.message || 'An unexpected error occurred',
    },
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Add validation error details if available
  if (err.errors && Array.isArray(err.errors)) {
    const validationErrors = err.errors.map(error => ({
      field: error.path,
      message: error.messages?.[0] || error.message,
    }));
    response.error.details = validationErrors;
  }

  logger.error(`[Error] ${req.method} ${req.originalUrl} → ${err.status || 500}: ${response.error.message}`);
  res.status(err.status || 500).json(response);
};

const converter = (err, req, res, next) => {
  let convertedError = err;

  if (err instanceof expressValidation.ValidationError) {
    convertedError = new APIError({
      message: 'Validation Error',
      errors: err.errors,
      status: err.status,
      stack: err.stack,
    });
  } else if (!(err instanceof APIError)) {
    convertedError = new APIError({
      message: err.message,
      status: err.status,
      stack: err.stack,
    });
  }

  logger.error('[Converter] Error converted:', convertedError.message);
  return handler(convertedError, req, res);
};

const notFound = (req, res, next) => {
  const err = new APIError({
    message: `Route ${req.originalUrl} not found`,
    status: httpStatus.NOT_FOUND,
  });
  return handler(err, req, res);
};

module.exports = { handler, converter, notFound };
