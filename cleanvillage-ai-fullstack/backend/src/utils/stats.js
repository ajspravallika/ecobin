const Bin = require('../models/Bin');
const CollectionHistory = require('../models/CollectionHistory');
const { STATUS, SENSOR_STATUS } = require('../config/constants');

/**
 * Computes the Dashboard summary cards:
 * Total Bins, Normal, Almost Full, Full, Collected Today,
 * Pending Collection, Offline Sensors.
 */
async function computeStats() {
  const [total, normal, almostFull, full, offline] = await Promise.all([
    Bin.countDocuments({}),
    Bin.countDocuments({ status: STATUS.NORMAL }),
    Bin.countDocuments({ status: STATUS.ALMOST_FULL }),
    Bin.countDocuments({ status: STATUS.FULL }),
    Bin.countDocuments({ sensorStatus: SENSOR_STATUS.OFFLINE }),
  ]);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const collectedToday = await CollectionHistory.countDocuments({
    collectedAt: { $gte: startOfDay },
  });

  const pendingCollection = almostFull + full;

  return { total, normal, almostFull, full, offline, collectedToday, pendingCollection };
}

module.exports = { computeStats };
