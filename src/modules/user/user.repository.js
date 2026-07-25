const User = require('./user.model');
const fetchData = require('../../utils/fetchData');

async function findByEmail(email, includePassword = false) {
  let query = User.findOne({ email });
  if (includePassword) {
    query = query.select('+password');
  }
  return query;
}

async function createUser(data) {
  return User.create(data);
}

async function findAllUsers(req, res) {
  return fetchData(req, res, User, { sort: { createdAt: -1, role: "user" } });
}

async function updateUserById(id, data) {
  return User.findByIdAndUpdate(id, data, { new: true });
}

async function deleteUserById(id) {
  return User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
}

module.exports = {
  findByEmail,
  createUser,
  findAllUsers,
  updateUserById,
  deleteUserById,
};
