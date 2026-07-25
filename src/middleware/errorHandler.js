const logger = require('../utils/logger');
const { sendError } = require('../utils/response');

class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  if (status >= 500) logger.error({ err }, 'Unhandled error');
  sendError(res, err, status);
}

module.exports = { errorHandler, AppError };
