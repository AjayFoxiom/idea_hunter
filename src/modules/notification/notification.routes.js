const express = require('express');
const notificationController = require('./notification.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/unread-count', notificationController.getUnreadCount);
router.get('/', notificationController.listNotifications);
router.patch('/read', notificationController.markAsRead);

module.exports = router;
