const cron = require('node-cron');
const https = require('https');
const http = require('http');
const logger = require('../utils/logger');

function startHealthCron() {
  const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 4000}`;
  const url = `${baseUrl}/health`;
  const client = url.startsWith('https') ? https : http;

  cron.schedule('*/5 * * * *', () => {
    client
      .get(url, (res) => {
        logger.info({ status: res.statusCode, url }, 'Health ping OK');
      })
      .on('error', (err) => {
        logger.warn({ err: err.message, url }, 'Health ping failed');
      });
  });

  logger.info({ url }, 'Health ping cron started (every 5 min)');
}

module.exports = { startHealthCron };
