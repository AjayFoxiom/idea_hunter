const jwt = require('jsonwebtoken');

const { AppError } = require('./errorHandler');
const User = require('../modules/user/user.model');
const asyncHandler = require('../utils/asyncHandler');

// Verifies the Bearer token and attaches req.user (without password).
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) throw new AppError(401, 'Not authenticated');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }

  const userId = payload.userId || payload.id || payload.sub;
  const user = await User.findById(userId);
  if (!user || !user.isActive) throw new AppError(401, 'User not found or inactive');

  req.user = user;
  req.userId = userId;
  next();
});

// Usage: authorize('admin', 'superAdmin')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) throw new AppError(401, 'Not authenticated');
  if (!roles.includes(req.user.role)) {
    throw new AppError(403, 'Insufficient permissions');
  }
  next();
};

module.exports = { protect, authorize };
