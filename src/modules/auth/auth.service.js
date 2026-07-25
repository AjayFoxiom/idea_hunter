const jwt = require('jsonwebtoken');
const userRepository = require('../user/user.repository');
const { AppError } = require('../../middleware/errorHandler');

function signToken(user) {
  return jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function register({ name, email, password }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) throw new AppError(409, 'Email already registered');

  // Public signup is always plain "user" — role escalation happens
  // via a separate admin-only endpoint, never through this path.
  const user = await userRepository.createUser({ name, email, password, role: 'user' });
  return { user: user.toSafeObject(), token: signToken(user) };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email, true);
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, 'Invalid email or password');
  }
  if (!user.isActive) throw new AppError(403, 'Account is deactivated');

  return { user: user.toSafeObject(), token: signToken(user) };
}

module.exports = { register, login };
