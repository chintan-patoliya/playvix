const httpStatus = require('http-status');

// Standardized response helper
exports.success = (res, data, message = 'Success', statusCode = httpStatus.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

exports.created = (res, data, message = 'Created successfully') => {
  return res.status(httpStatus.CREATED).json({
    success: true,
    message,
    data,
  });
};

exports.noContent = (res, message = 'Deleted successfully') => {
  return res.status(httpStatus.NO_CONTENT).json({
    success: true,
    message,
  });
};

// Paginated response helper
exports.paginated = (res, data, pagination, message = 'Success') => {
  return res.status(httpStatus.OK).json({
    success: true,
    message,
    data,
    pagination,
  });
};
