const notificationRepository = require('./notification.repository');
const { sendPushNotification } = require('../../utils/fcm');
const User = require('../user/user.model');
const logger = require('../../utils/logger');

/**
 * Create a notification record.
 * The Notification model's pre('save') hook automatically looks up the user
 * and triggers the FCM push notification if an FCM token is present.
 *
 * @param {string} userId
 * @param {string} title
 * @param {string} body
 * @param {Record<string,string>} [data={}]
 * @param {Object} [options={}]
 * @returns {Promise<import('./notification.model').default>}
 */
async function sendNotification(userId, title, body, data = {}, options = {}) {
  return notificationRepository.createNotification({
    userId,
    title,
    body,
    data,
    type: options.type,
    priority: options.priority || 'normal',
  });
}

async function getNotifications(userId) {
  return notificationRepository.findNotificationsByUser(userId);
}

/**
 * Mark a batch of notifications as read.
 * Accepts a comma-separated string or an array of ids.
 *
 * @param {string|string[]} ids
 * @param {string}          userId
 */
async function markAsRead(ids, userId) {
  const idArray = Array.isArray(ids)
    ? ids
    : String(ids).split(',').map((id) => id.trim()).filter(Boolean);

  if (!idArray.length) return { modifiedCount: 0 };
  return notificationRepository.markManyAsRead(idArray, userId);
}

async function getUnreadCount(userId) {
  return notificationRepository.countUnreadByUser(userId);
}

/**
 * Notify all active superAdmin users (and the triggering user, if provided).
 * Saves a notification to MongoDB and triggers FCM push via pre-save hook.
 */
async function notifySuperAdmins(title, body, data = {}, options = {}, triggerUserId = null) {
  try {
    const superAdmins = await User.find({
      role: 'superAdmin',
      isActive: true,
      isDeleted: false,
    });

    const targetUserIds = new Set(superAdmins.map((admin) => admin._id.toString()));

    // Also notify the user who triggered the harvest manually
    if (triggerUserId) {
      targetUserIds.add(triggerUserId.toString());
    }

    // Fallback: If no superAdmin exists yet in the database, notify active users with an FCM token
    if (targetUserIds.size === 0) {
      const activeUsersWithFcm = await User.find({
        isActive: true,
        isDeleted: false,
        fcm: { $exists: true, $ne: null, $ne: '' },
      }).limit(5);

      activeUsersWithFcm.forEach((u) => targetUserIds.add(u._id.toString()));
    }

    if (targetUserIds.size === 0) {
      console.log('[Notification.js] No target users found to notify for harvest.');
      return [];
    }

    const notifications = await Promise.all(
      Array.from(targetUserIds).map((id) =>
        sendNotification(id, title, body, data, options)
      )
    );

    return notifications;
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to notify superAdmins');
    return [];
  }
}

module.exports = {
  sendNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  notifySuperAdmins,
};
