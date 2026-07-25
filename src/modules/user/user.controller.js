const userService = require('./user.service');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');

const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers(req, res);
  sendSuccess(res, users, 'Users retrieved successfully');
});

const updateUser = asyncHandler(async (req, res) => {
  const result = await userService.updateUser(req.params.id, req.body);
  sendSuccess(res, result, 'User updated successfully');
});

const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id);
  sendSuccess(res, result, 'User deleted successfully');
});

module.exports = { listUsers, updateUser, deleteUser };
