const asyncHandler = require('express-async-handler');
const Bin = require('../models/Bin');
const CollectionHistory = require('../models/CollectionHistory');
const { computeStats } = require('../utils/stats');
const { STATUS } = require('../config/constants');

// @desc    Dashboard summary cards: Total, Normal, Almost Full, Full,
//          Collected Today, Pending Collection, Offline Sensors
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = asyncHandler(async (req, res) => {
  const stats = await computeStats();
  res.status(200).json({ success: true, data: stats });
});

// @desc    Pie chart: bin status distribution
// @route   GET /api/dashboard/charts/status-distribution
// @access  Private
const getStatusDistribution = asyncHandler(async (req, res) => {
  const agg = await Bin.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const map = Object.fromEntries(agg.map((a) => [a._id, a.count]));
  const data = Object.values(STATUS).map((status) => ({
    name: status,
    value: map[status] || 0,
  }));
  res.status(200).json({ success: true, data });
});

// @desc    Bar chart: bin counts per village, broken down by status
// @route   GET /api/dashboard/charts/village-breakdown
// @access  Private
const getVillageBreakdown = asyncHandler(async (req, res) => {
  const agg = await Bin.aggregate([
    {
      $group: {
        _id: { village: '$village', status: '$status' },
        count: { $sum: 1 },
      },
    },
  ]);

  const villages = {};
  agg.forEach(({ _id, count }) => {
    const { village, status } = _id;
    if (!villages[village]) {
      villages[village] = { village, Normal: 0, 'Almost Full': 0, Full: 0, Offline: 0 };
    }
    villages[village][status] = count;
  });

  res.status(200).json({ success: true, data: Object.values(villages) });
});

// @desc    Line chart: collections per day over the last N days (default 14)
// @route   GET /api/dashboard/charts/collection-trend?days=14
// @access  Private
const getCollectionTrend = asyncHandler(async (req, res) => {
  const days = Math.min(90, parseInt(req.query.days, 10) || 14);
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const agg = await CollectionHistory.aggregate([
    { $match: { collectedAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$collectedAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const map = Object.fromEntries(agg.map((a) => [a._id, a.count]));

  const data = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    data.push({ date: key, collections: map[key] || 0 });
  }

  res.status(200).json({ success: true, data });
});

module.exports = { getStats, getStatusDistribution, getVillageBreakdown, getCollectionTrend };
