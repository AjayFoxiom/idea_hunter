const express = require('express');
const rateLimit = require('express-rate-limit');
const harvestController = require('./harvest.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

// Gemini grounded search is billed per query — cap manual triggers hard.
const harvestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  message: { error: 'Harvest already run recently, try again later' },
});

router.get('/', protect, harvestLimiter, harvestController.triggerHarvest);

module.exports = router;
