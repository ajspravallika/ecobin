const asyncHandler = require('express-async-handler');
const Worker = require('../models/Worker');
const Bin = require('../models/Bin');

// @desc    List all workers
// @route   GET /api/workers
// @access  Private
const getWorkers = asyncHandler(async (req, res) => {
  const workers = await Worker.find({}).sort({ name: 1 });
  res.status(200).json({ success: true, count: workers.length, data: workers });
});

// @desc    Get a single worker
// @route   GET /api/workers/:workerId
// @access  Private
const getWorkerById = asyncHandler(async (req, res) => {
  const worker = await Worker.findOne({ workerId: req.params.workerId });
  if (!worker) {
    res.status(404);
    throw new Error(`Worker ${req.params.workerId} not found`);
  }
  res.status(200).json({ success: true, data: worker });
});

// @desc    Get bins assigned to a specific worker (Worker Dashboard: Today's Tasks)
// @route   GET /api/workers/:workerId/bins
// @access  Private
const getWorkerBins = asyncHandler(async (req, res) => {
  const bins = await Bin.find({ assignedWorkerId: req.params.workerId }).sort({ fillLevel: -1 });
  res.status(200).json({ success: true, count: bins.length, data: bins });
});

// @desc    Create a worker profile
// @route   POST /api/workers
// @access  Private (Admin, Officer)
const createWorker = asyncHandler(async (req, res) => {
  const { workerId, name, phone, villages } = req.body;
  if (!workerId || !name || !phone) {
    res.status(400);
    throw new Error('workerId, name and phone are required');
  }
  const exists = await Worker.findOne({ workerId });
  if (exists) {
    res.status(409);
    throw new Error(`Worker ${workerId} already exists`);
  }
  const worker = await Worker.create({ workerId, name, phone, villages: villages || [] });
  res.status(201).json({ success: true, data: worker });
});

// @desc    Update a worker profile
// @route   PUT /api/workers/:workerId
// @access  Private (Admin, Officer)
const updateWorker = asyncHandler(async (req, res) => {
  const worker = await Worker.findOneAndUpdate({ workerId: req.params.workerId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!worker) {
    res.status(404);
    throw new Error(`Worker ${req.params.workerId} not found`);
  }
  res.status(200).json({ success: true, data: worker });
});

// @desc    Deactivate/delete a worker
// @route   DELETE /api/workers/:workerId
// @access  Private (Admin)
const deleteWorker = asyncHandler(async (req, res) => {
  const worker = await Worker.findOneAndDelete({ workerId: req.params.workerId });
  if (!worker) {
    res.status(404);
    throw new Error(`Worker ${req.params.workerId} not found`);
  }
  res.status(200).json({ success: true, message: `Worker ${worker.workerId} removed` });
});

module.exports = { getWorkers, getWorkerById, getWorkerBins, createWorker, updateWorker, deleteWorker };
