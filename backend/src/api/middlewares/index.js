const { authorize } = require('./auth');
const { handler, converter, notFound } = require('./error');

module.exports = {
  authorize,
  errorHandler: handler,
  errorConverter: converter,
  notFound,
};
