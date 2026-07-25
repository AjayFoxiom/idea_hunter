const userRepository = require('./user.repository');
const { AppError } = require('../../middleware/errorHandler');

async function listUsers(req, res) {
  return userRepository.findAllUsers(req, res);
}

async function updateUser(id, data) {
  const user = await userRepository.updateUserById(id, data);
  if (!user) throw new AppError(404, 'User not found');
  return user;
}

async function deleteUser(id) {
  const user = await userRepository.deleteUserById(id);
  if (!user) throw new AppError(404, 'User not found');
  return user;
}

module.exports = { listUsers, updateUser, deleteUser };
