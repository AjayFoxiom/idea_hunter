const dashboardRepository = require('./dashboard.repository');
const { IDEA_STATUSES } = require('../../constants/ideaStatus');

const VALID_PERIODS = ['week', 'month', 'year'];

/**
 * Status counts — always returns an entry for every known status
 * so the frontend doesn't need to handle missing keys.
 */
async function getStatusCounts() {
  const rows = await dashboardRepository.getStatusCounts();

  // Build a zero-filled map for every status, then overlay DB results
  const countMap = Object.fromEntries(IDEA_STATUSES.map(s => [s, 0]));
  for (const row of rows) {
    countMap[row.status] = row.count;
  }

  return Object.entries(countMap).map(([status, count]) => ({ status, count }));
}

/**
 * Chart data grouped by the requested period.
 * Defaults to 'week' if period is missing or invalid.
 */
async function getChartData(period) {
  const resolved = VALID_PERIODS.includes(period) ? period : 'week';
  const data = await dashboardRepository.getChartData(resolved);
  return { period: resolved, data };
}

module.exports = { getStatusCounts, getChartData };
