const cron = require('node-cron');
const { runHarvest } = require('../modules/harvest/harvest.controller');
const logger = require('../utils/logger');

const DEFAULT_HOUR = 20;
const DEFAULT_MINUTE = 45;

async function resolveSchedule() {
  try {
    const User = require('../modules/user/user.model');
    const superAdmin = await User.findOne({ role: 'superAdmin', isDeleted: false }).lean();

    if (superAdmin && typeof superAdmin.autoSearchTime === 'number') {
      const totalMinutes = superAdmin.autoSearchTime;
      const hour = Math.floor(totalMinutes / 60) % 24;
      const minute = totalMinutes % 60;
      logger.info({ totalMinutes, hour, minute }, 'Using superAdmin autoSearchTime for harvest cron');
      return { hour, minute };
    }
  } catch (err) {
    logger.warn({ err }, 'Could not read superAdmin autoSearchTime; using default schedule');
  }

  return { hour: DEFAULT_HOUR, minute: DEFAULT_MINUTE };
}

async function startHarvestCron() {
  const { hour, minute } = await resolveSchedule();
  const expression = `${minute} ${hour} * * *`;

  logger.info({ expression }, 'Harvest cron scheduled');

  cron.schedule(expression, async () => {
    const date = new Date().toISOString().slice(0, 10);
    logger.info({ date }, 'Running scheduled harvest');
    try {
      await runHarvest(null, date);
    } catch (err) {
      logger.error({ err }, 'Scheduled harvest failed');
    }
  });
}

module.exports = { startHarvestCron };
