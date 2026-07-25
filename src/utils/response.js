function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function sendError(res, error, statusCode = 500) {
  const message = typeof error === 'string' ? error : (error.message || 'Server Error');
  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = {
  sendSuccess,
  sendError,
};
