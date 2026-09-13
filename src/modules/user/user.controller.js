const userService = require('./user.service');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const { AppError } = require('../../middleware/errorHandler');

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.userId || req.user?._id;
  const user = await userService.getUserById(userId);
  sendSuccess(res, user, 'Profile retrieved successfully');
});

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, req.user, 'User details retrieved successfully');
});

const updateMe = asyncHandler(async (req, res) => {
  const userId = req.userId || req.user?._id;
  const { password, role, isDeleted, email, ...allowedUpdates } = req.body;
  const updatedUser = await userService.updateUser(userId, allowedUpdates);
  sendSuccess(res, updatedUser, 'Profile updated successfully');
});

const getUserById = asyncHandler(async (req, res) => {
  const isSelf = req.user._id.toString() === req.params.id;
  const isSuperAdmin = req.user.role === 'superAdmin';
  if (!isSelf && !isSuperAdmin) {
    throw new AppError(403, 'Insufficient permissions');
  }

  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, user, 'User retrieved successfully');
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers(req, res);
  sendSuccess(res, users, 'Users retrieved successfully');
});

const updateUser = asyncHandler(async (req, res) => {
  const isSelf = req.user._id.toString() === req.params.id;
  const isSuperAdmin = req.user.role === 'superAdmin';
  if (!isSelf && !isSuperAdmin) {
    throw new AppError(403, 'Insufficient permissions');
  }

  const updates = { ...req.body };
  if (!isSuperAdmin) {
    delete updates.role;
    delete updates.isDeleted;
  }
  delete updates.password;

  const result = await userService.updateUser(req.params.id, updates);
  sendSuccess(res, result, 'User updated successfully');
});

const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id);
  sendSuccess(res, result, 'User deleted successfully');
});

module.exports = { getProfile, getMe, updateMe, getUserById, listUsers, updateUser, deleteUser };
