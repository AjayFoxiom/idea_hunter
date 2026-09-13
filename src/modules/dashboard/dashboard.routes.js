const express = require('express');
const dashboardController = require('./dashboard.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/status', dashboardController.getStatusCounts);
router.get('/chart', dashboardController.getChartData);

module.exports = router;
