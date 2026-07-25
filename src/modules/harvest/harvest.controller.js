const asyncHandler = require('../../utils/asyncHandler');
const harvestService = require('./harvest.service');
const ideaService = require('../idea/idea.service');
const logger = require('../../utils/logger');
const { sendSuccess } = require('../../utils/response');

const DDMMYYYY_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

// Parses "dd/mm/yyyy" into "yyyy-mm-dd" (the format harvestIdeas expects).
// Throws on malformed input or an invalid calendar date so the caller
// gets a clear 400 instead of a silent wrong-date harvest.
function parseDateInput(dateStr) {
  const match = dateStr.match(DDMMYYYY_REGEX);
  if (!match) {
    throw new Error('Invalid date format. Expected dd/mm/yyyy.');
  }

  const [, dd, mm, yyyy] = match;
  const iso = `${yyyy}-${mm}-${dd}`;
  const parsed = new Date(iso);

  // Catches both unparsable strings and out-of-range calendar dates
  // (e.g. 31/02/2026), since new Date() silently rolls those over.
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== iso) {
    throw new Error('Invalid calendar date.');
  }

  return iso;
}

// Exported separately from the route handler so jobs/harvestCron.js
// can call the same logic without going through Express.
async function runHarvest(userId, date) {
  const targetDate = date || new Date().toISOString().slice(0, 10);

  logger.info({ date: targetDate }, 'Running harvest across all sources');

  const candidates = await harvestService.harvestIdeas(targetDate);
  const saved = await ideaService.saveNewIdeas(candidates, userId);

  return saved;
}

const triggerHarvest = asyncHandler(async (req, res) => {
  const { date } = req.body || {};
  const targetDate = date ? parseDateInput(date) : undefined;

  const saved = await runHarvest(req.user?._id, targetDate);
  sendSuccess(res, saved, 'Harvest triggered successfully');
});

module.exports = { runHarvest, triggerHarvest };