const asyncHandler = require('express-async-handler');
const CollectionHistory = require('../models/CollectionHistory');

// @desc    List collection history (powers Collection History + Reports pages)
// @route   GET /api/history?village=&worker=&from=&to=&page=&limit=
// @access  Private
const getHistory = asyncHandler(async (req, res) => {
  const { village, worker, from, to, page = 1, limit = 50 } = req.query;

  const query = {};
  if (village) query.village = new RegExp(`^${village}$`, 'i');
  if (worker) query.worker = new RegExp(worker, 'i');

  // Workers only ever see their own collection history.
  if (req.user.role === 'Waste Collection Worker') {
    query.worker = new RegExp(req.user.name, 'i');
  }

  if (from || to) {
    query.collectedAt = {};
    if (from) query.collectedAt.$gte = new Date(from);
    if (to) query.collectedAt.$lte = new Date(to);
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, parseInt(limit, 10) || 50);

  const [records, total] = await Promise.all([
    CollectionHistory.find(query)
      .sort({ collectedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    CollectionHistory.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: records.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: records,
  });
});

module.exports = { getHistory };
