const cron = require('node-cron');
const { runHarvest } = require('../modules/harvest/harvest.controller');
const logger = require('../utils/logger');

function startHarvestCron() {
  cron.schedule('45 20 * * *', async () => {
    logger.info('Running scheduled harvest');
    try {
      await runHarvest(null);
    } catch (err) {
      logger.error({ err }, 'Scheduled harvest failed');
    }
  });
}

module.exports = { startHarvestCron };
