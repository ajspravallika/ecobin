const Bin = require('../models/Bin');
const Notification = require('../models/Notification');
const CollectionHistory = require('../models/CollectionHistory');
const { STATUS, SENSOR_STATUS, getStatusFromFill, priorityFromFill } = require('../config/constants');
const { emitBinUpdate, emitNewNotification, emitStatsUpdate } = require('../socket');
const { computeStats } = require('./stats');

/**
 * Central mutator: apply a new fill level to a bin, recompute status, and
 * fire a notification whenever the bin crosses upward into Almost Full /
 * Full territory. This is the server-side twin of the frontend's
 * AppContext.applyFillLevel, and is the single path used by:
 *   - the manual "fill level slider" endpoint (PATCH /bins/:binId/fill)
 *   - the ESP32 ingest endpoint (POST /esp32/data)
 *   - the auto-simulation tick (setInterval on the server)
 *
 * Workflow reminder:
 *   Ultrasonic sensor measures distance -> ESP32 calculates fill % ->
 *   ESP32 sends { binId, fillLevel } -> backend finds bin by binId ->
 *   location already known -> status recomputed -> notification
 *   generated on crossing -> dashboard updates (via socket.io).
 */
async function applyFillLevel(binId, fillLevel, { markOnline = true } = {}) {
  const bin = await Bin.findOne({ binId: binId.toUpperCase() });
  if (!bin) {
    const err = new Error(`Bin ${binId} not found`);
    err.statusCode = 404;
    throw err;
  }

  const clamped = Math.max(0, Math.min(100, Math.round(fillLevel)));
  const prevStatus = bin.status;
  const newStatus = getStatusFromFill(clamped);

  bin.fillLevel = clamped;
  bin.status = newStatus;
  bin.lastUpdated = new Date();
  if (markOnline) bin.sensorStatus = SENSOR_STATUS.ONLINE;
  await bin.save();

  emitBinUpdate(bin);

  const crossedUp =
    (newStatus === STATUS.FULL && prevStatus !== STATUS.FULL) ||
    (newStatus === STATUS.ALMOST_FULL && prevStatus === STATUS.NORMAL);

  let notification = null;
  if (crossedUp) {
    notification = await Notification.create({
      binId: bin.binId,
      village: bin.village,
      location: bin.landmark,
      ward: bin.ward,
      fillLevel: bin.fillLevel,
      status: bin.status,
      priority: priorityFromFill(bin.fillLevel),
      read: false,
    });
    emitNewNotification(notification);
  }

  const stats = await computeStats();
  emitStatsUpdate(stats);

  return { bin, notification };
}

/**
 * Marks a bin as collected: resets fill to 0%, logs a CollectionHistory
 * entry, and clears any open notifications for that bin — mirroring the
 * Worker Dashboard's "Mark as Collected" button behavior.
 */
async function markCollected(binId, { workerName } = {}) {
  const bin = await Bin.findOne({ binId: binId.toUpperCase() });
  if (!bin) {
    const err = new Error(`Bin ${binId} not found`);
    err.statusCode = 404;
    throw err;
  }

  const history = await CollectionHistory.create({
    binId: bin.binId,
    village: bin.village,
    location: bin.landmark,
    ward: bin.ward,
    worker: workerName || bin.assignedWorkerName,
    fillLevelBeforeCollection: bin.fillLevel,
    collectedAt: new Date(),
  });

  bin.fillLevel = 0;
  bin.status = STATUS.NORMAL;
  bin.lastUpdated = new Date();
  await bin.save();

  await Notification.deleteMany({ binId: bin.binId });

  emitBinUpdate(bin);
  const stats = await computeStats();
  emitStatsUpdate(stats);

  return { bin, history };
}

module.exports = { applyFillLevel, markCollected };
