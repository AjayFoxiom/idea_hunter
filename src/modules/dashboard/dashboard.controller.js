const asyncHandler = require('../../utils/asyncHandler');
const dashboardService = require('./dashboard.service');
const { sendSuccess } = require('../../utils/response');

/**
 * GET /api/dashboard/status
 * Returns idea count per status.
 *
 * Response example:
 * {
 *   "data": [
 *     { "status": "inbox",         "count": 14 },
 *     { "status": "inreview",      "count": 3  },
 *     { "status": "shortlisted",   "count": 5  },
 *     { "status": "rejected",      "count": 2  },
 *     { "status": "indevelopment", "count": 1  }
 *   ]
 * }
 */
const getStatusCounts = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStatusCounts();
  sendSuccess(res, data, 'Status counts retrieved successfully');
});

/**
 * GET /api/dashboard/chart?period=week|month|year
 * Returns idea count grouped by the requested period (default: week).
 *
 * week  → [{ label: "2026-09-06", count: 3 }, ...]   (7 days)
 * month → [{ label: "Week 1", count: 8 }, ...]        (current month, by week)
 * year  → [{ label: "Jan", count: 12 }, ...]          (current year, by month)
 */
const getChartData = asyncHandler(async (req, res) => {
  const { period } = req.query;
  const result = await dashboardService.getChartData(period);
  sendSuccess(res, result, 'Chart data retrieved successfully');
});

module.exports = { getStatusCounts, getChartData };
