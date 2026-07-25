const asyncHandler = require('../../utils/asyncHandler');
const harvestService = require('./harvest.service');
const ideaService = require('../idea/idea.service');
const logger = require('../../utils/logger');
const { sendSuccess } = require('../../utils/response');

// Exported separately from the route handler so jobs/harvestCron.js
// can call the same logic without going through Express.
async function runHarvest(userId) {
  const date = new Date().toISOString().slice(0, 10);

  logger.info({ date }, 'Running harvest across all sources');

  const candidates = await harvestService.harvestIdeas(date);
  const saved = await ideaService.saveNewIdeas(candidates, userId);

  return saved;
}

const triggerHarvest = asyncHandler(async (req, res) => {
  const saved = await runHarvest(req.user?._id);
  sendSuccess(res, saved, 'Harvest triggered successfully');
});

module.exports = { runHarvest, triggerHarvest };