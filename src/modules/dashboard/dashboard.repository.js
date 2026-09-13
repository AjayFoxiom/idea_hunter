const Idea = require('../idea/idea.model');

/**
 * Returns idea count grouped by status.
 * Example: [{ status: 'inbox', count: 12 }, ...]
 */
async function getStatusCounts() {
  return Idea.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { _id: 0, status: '$_id', count: 1 } },
    { $sort: { status: 1 } },
  ]);
}

/**
 * Builds a date-range + grouping aggregation for the chart endpoint.
 *
 * @param {'week'|'month'|'year'} period
 * @returns {{ data: Array, period: string }}
 *
 * Groupings:
 *   week  → each day  (label: "YYYY-MM-DD")
 *   month → each week (label: "Week 1" … "Week 4/5")
 *   year  → each month (label: "Jan" … "Dec")
 */
async function getChartData(period) {
  const now = new Date();

  let from;
  let groupExpr;
  let labelExpr;
  let sortExpr;

  if (period === 'week') {
    // Last 7 days (today inclusive)
    from = new Date(now);
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);

    // Group by calendar date "YYYY-MM-DD"
    groupExpr = {
      $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
    };
    labelExpr = groupExpr;
    sortExpr = { _id: 1 };
  } else if (period === 'month') {
    // Current calendar month
    from = new Date(now.getFullYear(), now.getMonth(), 1);

    // Group by ISO week-of-month (1-based day-of-month → Math.ceil(day/7))
    groupExpr = {
      $ceil: { $divide: [{ $dayOfMonth: '$createdAt' }, 7] },
    };
    labelExpr = { $concat: ['Week ', { $toString: groupExpr }] };
    sortExpr = { _id: 1 };
  } else {
    // year — current calendar year
    from = new Date(now.getFullYear(), 0, 1);

    // Group by month number 1–12
    groupExpr = { $month: '$createdAt' };
    labelExpr = {
      $arrayElemAt: [
        ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        groupExpr,
      ],
    };
    sortExpr = { _id: 1 };
  }

  const rows = await Idea.aggregate([
    {
      $match: {
        isDeleted: false,
        createdAt: { $gte: from, $lte: now },
      },
    },
    {
      $group: {
        _id: groupExpr,
        label: { $first: labelExpr },
        count: { $sum: 1 },
      },
    },
    { $sort: sortExpr },
    { $project: { _id: 0, label: 1, count: 1 } },
  ]);

  return rows;
}

module.exports = { getStatusCounts, getChartData };
