const asyncHandler = require('../../utils/asyncHandler');
const harvestService = require('./harvest.service');
const ideaService = require('../idea/idea.service');
const notificationService = require('../notification/notification.service');
const logger = require('../../utils/logger');
const { sendSuccess } = require('../../utils/response');

const DDMMYYYY_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

function parseDateInput(dateStr) {
  const match = dateStr.match(DDMMYYYY_REGEX);
  if (!match) throw new Error('Invalid date format. Expected dd/mm/yyyy.');

  const [, dd, mm, yyyy] = match;
  const iso = `${yyyy}-${mm}-${dd}`;
  const parsed = new Date(iso);

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== iso) {
    throw new Error('Invalid calendar date.');
  }

  return iso;
}

async function runHarvest(userId, date) {
  const targetDate = date || new Date().toISOString().slice(0, 10);

  logger.info({ date: targetDate }, 'Running harvest across all sources');

  const candidates = await harvestService.harvestIdeas(targetDate);
  const saved = await ideaService.saveNewIdeas(candidates, userId);

  const count = saved.length;
  const title = 'Harvest Completed';
  const body =
    count > 0
      ? `Successfully harvested and saved ${count} new idea${count > 1 ? 's' : ''} for ${targetDate}.`
      : `Harvest completed for ${targetDate}. No new ideas found.`;

  notificationService
    .notifySuperAdmins(
      title,
      body,
      { type: 'HARVEST_COMPLETED', count: String(count), date: String(targetDate) },
      { type: 'HARVEST_COMPLETED', priority: count > 0 ? 'high' : 'normal' },
      userId
    )
    .catch((err) => logger.error({ err: err.message }, 'Failed to notify superAdmin after harvest'));

  return saved;
}

const triggerHarvest = asyncHandler(async (req, res) => {
  const { date } = req.body || {};
  const targetDate = date ? parseDateInput(date) : undefined;
  const saved = await runHarvest(req.user?._id, targetDate);
  sendSuccess(res, saved, 'Harvest triggered successfully');
});

module.exports = { runHarvest, triggerHarvest };