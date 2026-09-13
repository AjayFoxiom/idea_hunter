const asyncHandler = require('../../utils/asyncHandler');
const notificationService = require('./notification.service');
const { sendSuccess } = require('../../utils/response');
const { AppError } = require('../../middleware/errorHandler');

/**
 * GET /api/notifications
 * Returns all notifications for the authenticated user (newest first).
 */
const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getNotifications(req.user._id);
  sendSuccess(res, notifications, 'Notifications retrieved successfully');
});

/**
 * PATCH /api/notifications/read
 * Mark one or more notifications as read.
 *
 * Accepts ids as:
 *   - Query string:   ?ids=id1,id2,id3
 *   - JSON body:      { "ids": ["id1", "id2"] }  or  { "ids": "id1,id2" }
 *
 * Response: { modifiedCount: N }
 */
const markAsRead = asyncHandler(async (req, res) => {
  const ids = req.body.ids ?? req.query.ids;

  if (!ids || (Array.isArray(ids) && !ids.length)) {
    throw new AppError(400, 'ids is required — provide a comma-separated string or array');
  }

  const result = await notificationService.markAsRead(ids, req.user._id);
  sendSuccess(res, { modifiedCount: result.modifiedCount }, 'Notifications marked as read');
});

/**
 * GET /api/notifications/unread-count
 * Returns unread notification count for the authenticated user.
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  sendSuccess(res, { count, unreadCount: count }, 'Unread count retrieved successfully');
});

module.exports = { listNotifications, markAsRead, getUnreadCount };
