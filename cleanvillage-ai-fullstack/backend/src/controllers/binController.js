const asyncHandler = require('express-async-handler');
const Bin = require('../models/Bin');
const Worker = require('../models/Worker');
const { applyFillLevel, markCollected } = require('../utils/binEngine');
const { emitBinUpdate, emitStatsUpdate } = require('../socket');
const { computeStats } = require('../utils/stats');
const { SENSOR_STATUS } = require('../config/constants');

// @desc    List bins with optional filters/search (powers Bin Management page)
// @route   GET /api/bins?village=&status=&sensorStatus=&worker=&search=&page=&limit=
// @access  Private
const getBins = asyncHandler(async (req, res) => {
  const { village, status, sensorStatus, worker, search, page = 1, limit = 100 } = req.query;

  const query = {};
  if (village) query.villageId = village.toLowerCase();
  if (status) query.status = status;
  if (sensorStatus) query.sensorStatus = sensorStatus;
  if (worker) query.assignedWorkerId = worker;

  // Workers only ever see their own assigned bins, regardless of query params.
  if (req.user.role === 'Waste Collection Worker') {
    query.assignedWorkerId = req.user.workerId;
  }

  if (search) {
    const re = new RegExp(search, 'i');
    query.$or = [{ binId: re }, { village: re }, { landmark: re }, { ward: re }];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, parseInt(limit, 10) || 100);

  const [bins, total] = await Promise.all([
    Bin.find(query)
      .sort({ binId: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Bin.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: bins.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: bins,
  });
});

// @desc    Get a single bin by Bin ID (powers Bin Details page)
// @route   GET /api/bins/:binId
// @access  Private
const getBinById = asyncHandler(async (req, res) => {
  const bin = await Bin.findOne({ binId: req.params.binId.toUpperCase() });
  if (!bin) {
    res.status(404);
    throw new Error(`Bin ${req.params.binId} not found`);
  }
  res.status(200).json({ success: true, data: bin });
});

// @desc    Create a new bin (powers Add Bin page)
// @route   POST /api/bins
// @access  Private (Admin, Officer)
const createBin = asyncHandler(async (req, res) => {
  const {
    binId,
    villageId,
    village,
    mandal,
    ward,
    landmark,
    assignedWorkerId,
    binType,
    capacityLiters,
    fillLevel,
    sensorStatus,
  } = req.body;

  if (!binId || !villageId || !village || !ward || !landmark) {
    res.status(400);
    throw new Error('binId, villageId, village, ward and landmark are required');
  }

  const existing = await Bin.findOne({ binId: binId.toUpperCase() });
  if (existing) {
    res.status(409);
    throw new Error(`Bin ${binId} already exists`);
  }

  let assignedWorkerName = null;
  if (assignedWorkerId) {
    const workerDoc = await Worker.findOne({ workerId: assignedWorkerId });
    assignedWorkerName = workerDoc ? workerDoc.name : null;
  }

  const bin = await Bin.create({
    binId: binId.toUpperCase(),
    villageId: villageId.toLowerCase(),
    village,
    mandal,
    ward,
    landmark,
    assignedWorkerId: assignedWorkerId || null,
    assignedWorkerName,
    sensorStatus: sensorStatus || SENSOR_STATUS.ONLINE,
    fillLevel: fillLevel || 0,
    binType,
    capacityLiters,
    lastUpdated: new Date(),
  });

  emitBinUpdate(bin);
  emitStatsUpdate(await computeStats());

  res.status(201).json({ success: true, data: bin });
});

// @desc    Update a bin's details (powers Edit Bin page)
// @route   PUT /api/bins/:binId
// @access  Private (Admin, Officer)
const updateBin = asyncHandler(async (req, res) => {
  const bin = await Bin.findOne({ binId: req.params.binId.toUpperCase() });
  if (!bin) {
    res.status(404);
    throw new Error(`Bin ${req.params.binId} not found`);
  }

  const editable = [
    'villageId',
    'village',
    'mandal',
    'ward',
    'landmark',
    'assignedWorkerId',
    'binType',
    'capacityLiters',
    'sensorStatus',
  ];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) bin[field] = req.body[field];
  });

  if (req.body.assignedWorkerId) {
    const workerDoc = await Worker.findOne({ workerId: req.body.assignedWorkerId });
    bin.assignedWorkerName = workerDoc ? workerDoc.name : bin.assignedWorkerName;
  }

  bin.lastUpdated = new Date();
  await bin.save();

  emitBinUpdate(bin);
  emitStatsUpdate(await computeStats());

  res.status(200).json({ success: true, data: bin });
});

// @desc    Delete a bin
// @route   DELETE /api/bins/:binId
// @access  Private (Admin)
const deleteBin = asyncHandler(async (req, res) => {
  const bin = await Bin.findOneAndDelete({ binId: req.params.binId.toUpperCase() });
  if (!bin) {
    res.status(404);
    throw new Error(`Bin ${req.params.binId} not found`);
  }
  emitStatsUpdate(await computeStats());
  res.status(200).json({ success: true, message: `Bin ${bin.binId} deleted` });
});

// @desc    Simulate the ultrasonic sensor's fill-level slider (0-100%).
//          Recomputes status and auto-generates a notification on crossing.
// @route   PATCH /api/bins/:binId/fill
// @access  Private (Admin, Officer) — worker UIs shouldn't need this
const setFillLevel = asyncHandler(async (req, res) => {
  const { fillLevel } = req.body;
  if (fillLevel === undefined || Number.isNaN(Number(fillLevel))) {
    res.status(400);
    throw new Error('fillLevel (0-100) is required');
  }
  const { bin, notification } = await applyFillLevel(req.params.binId, Number(fillLevel));
  res.status(200).json({ success: true, data: bin, notification });
});

// @desc    Toggle a bin's sensor online/offline status
// @route   PATCH /api/bins/:binId/sensor-status
// @access  Private (Admin, Officer)
const setSensorStatus = asyncHandler(async (req, res) => {
  const { sensorStatus } = req.body;
  if (!Object.values(SENSOR_STATUS).includes(sensorStatus)) {
    res.status(400);
    throw new Error(`sensorStatus must be one of ${Object.values(SENSOR_STATUS).join(', ')}`);
  }
  const bin = await Bin.findOneAndUpdate(
    { binId: req.params.binId.toUpperCase() },
    { sensorStatus, lastUpdated: new Date() },
    { new: true }
  );
  if (!bin) {
    res.status(404);
    throw new Error(`Bin ${req.params.binId} not found`);
  }
  emitBinUpdate(bin);
  emitStatsUpdate(await computeStats());
  res.status(200).json({ success: true, data: bin });
});

// @desc    Mark a bin as collected: reset fill to 0%, log history, clear
//          notifications (powers the Worker Dashboard's "Mark as Collected")
// @route   PATCH /api/bins/:binId/collect
// @access  Private (Worker, Admin, Officer)
const collectBin = asyncHandler(async (req, res) => {
  const workerName = req.body.workerName || req.user.name;
  const { bin, history } = await markCollected(req.params.binId, { workerName });
  res.status(200).json({ success: true, data: bin, history });
});

module.exports = {
  getBins,
  getBinById,
  createBin,
  updateBin,
  deleteBin,
  setFillLevel,
  setSensorStatus,
  collectBin,
};
