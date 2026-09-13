const Notification = require('./notification.model');

async function createNotification(data) {
  return Notification.create(data);
}

async function findNotificationsByUser(userId) {
  return Notification.find({ userId }).sort({ createdAt: -1 });
}

/**
 * Mark multiple notifications as read.
 * Only updates documents that belong to userId (prevents cross-user tampering).
 *
 * @param {string[]} ids    - Notification ObjectId strings
 * @param {string}   userId - The authenticated user's id
 */
async function markManyAsRead(ids, userId) {
  return Notification.updateMany(
    { _id: { $in: ids }, userId },
    { $set: { isRead: true } }
  );
}

async function deleteNotificationById(id, userId) {
  return Notification.findOneAndDelete({ _id: id, userId });
}

async function countUnreadByUser(userId) {
  return Notification.countDocuments({ userId, isRead: false });
}

module.exports = {
  createNotification,
  findNotificationsByUser,
  countUnreadByUser,
  markManyAsRead,
  deleteNotificationById,
};
