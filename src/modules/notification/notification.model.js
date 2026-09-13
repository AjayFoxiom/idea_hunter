const mongoose = require('mongoose');
const { sendPushNotification } = require('../../utils/fcm');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, default: 'IdeaHunter' },
    body: { type: String, required: true, trim: true, alias: 'message' },
    type: { type: String, trim: true },
    priority: { type: String, enum: ['normal', 'high'], default: 'normal' },
    data: { type: Map, of: String, default: {} },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.pre('save', async function (next) {
  try {
    console.log(`[Notification.js] Saving notification for userId: ${this.userId}, type: ${this.type || 'general'}`);
    const User = mongoose.model('User');
    const user = await User.findById(this.userId).select('name email fcm enableNotifications');

    if (user) {
      console.log(`[Notification.js] User found: ${user.name || user.email || user._id}`);
      if (user.enableNotifications === false) {
        console.log(`[Notification.js] Skipped FCM sending because enableNotifications is disabled for user: ${user._id}`);
      } else if (user.fcm) {
        console.log(`[Notification.js] FCM Token present. Attempting to send FCM to token: ${user.fcm.slice(-8)}`);
        
        const payloadData = this.data instanceof Map ? Object.fromEntries(this.data) : (this.data || {});
        if (this.type) payloadData.type = String(this.type);
        if (this.priority) payloadData.priority = String(this.priority);

        await sendPushNotification(
          user.fcm,
          this.title,
          this.body,
          payloadData
        );
        console.log(`[Notification.js] FCM sending process triggered.`);
      } else {
        console.log(`[Notification.js] Skipped FCM sending because fcm token is missing.`);
      }
    } else {
      console.log(`[Notification.js] No user found for userId: ${this.userId}`);
    }
  } catch (error) {
    console.error(`[Notification.js] Error in pre-save hook:`, error);
  }

  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
