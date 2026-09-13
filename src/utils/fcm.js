const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const logger = require('./logger');

const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin once (idempotent).
function initFirebase() {
  if (getApps().length) return;

  try {
    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : process.env.FIREBASE_SERVICE_ACCOUNT;
      credential = cert(serviceAccount);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const credPath = path.isAbsolute(process.env.GOOGLE_APPLICATION_CREDENTIALS)
        ? process.env.GOOGLE_APPLICATION_CREDENTIALS
        : path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);

      if (fs.existsSync(credPath)) {
        const fileContent = JSON.parse(fs.readFileSync(credPath, 'utf8'));
        credential = cert(fileContent);
      } else {
        const { applicationDefault } = require('firebase-admin/app');
        credential = applicationDefault();
      }
    } else {
      // Auto-detect any firebase-adminsdk*.json file located in src/utils
      const found = fs.readdirSync(__dirname).find(f => f.includes('firebase-adminsdk') && f.endsWith('.json'));
      if (found) {
        const fileContent = JSON.parse(fs.readFileSync(path.join(__dirname, found), 'utf8'));
        credential = cert(fileContent);
      } else {
        logger.warn('FCM credentials not set in .env. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS.');
        return;
      }
    }

    initializeApp({ credential });
    logger.info('Firebase Admin SDK initialized successfully');
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to initialize Firebase Admin SDK');
  }
}

initFirebase();

/**
 * Send a push notification to a single FCM token.
 *
 * @param {string} fcmToken
 * @param {string} title
 * @param {string} body
 * @param {Record<string,string>} [data={}]
 * @returns {Promise<string|null>} FCM message ID on success, null on failure
 */
async function sendPushNotification(fcmToken, title, body, data = {}) {
  if (!fcmToken) {
    logger.warn('sendPushNotification called without an FCM token — skipped');
    return null;
  }

  if (!getApps().length) {
    initFirebase();
  }

  if (!getApps().length) {
    logger.warn('FCM push skipped: Firebase Admin SDK is not initialized (missing service account credentials)');
    return null;
  }

  const message = {
    token: fcmToken,
    notification: { title, body },
    // FCM data payload values must all be strings
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    ),
  };

  try {
    const messageId = await getMessaging().send(message);
    logger.info({ fcmToken: fcmToken.slice(-8), messageId }, 'FCM push sent');
    return messageId;
  } catch (err) {
    logger.error({ fcmToken: fcmToken.slice(-8), err: err.message }, 'FCM push failed');
    return null;
  }
}

module.exports = { sendPushNotification };
