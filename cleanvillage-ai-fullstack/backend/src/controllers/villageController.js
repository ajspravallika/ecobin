const asyncHandler = require('express-async-handler');
const Village = require('../models/Village');
const Bin = require('../models/Bin');

// @desc    List all villages
// @route   GET /api/villages
// @access  Private
const getVillages = asyncHandler(async (req, res) => {
  const villages = await Village.find({}).sort({ name: 1 });
  res.status(200).json({ success: true, count: villages.length, data: villages });
});

// @desc    Create a village
// @route   POST /api/villages
// @access  Private (Admin)
const createVillage = asyncHandler(async (req, res) => {
  const { villageId, name, ward, mandal } = req.body;
  if (!villageId || !name || !ward || !mandal) {
    res.status(400);
    throw new Error('villageId, name, ward and mandal are required');
  }
  const exists = await Village.findOne({ villageId: villageId.toLowerCase() });
  if (exists) {
    res.status(409);
    throw new Error(`Village '${villageId}' already exists`);
  }
  const village = await Village.create({ villageId: villageId.toLowerCase(), name, ward, mandal });
  res.status(201).json({ success: true, data: village });
});

// @desc    Update a village
// @route   PUT /api/villages/:villageId
// @access  Private (Admin)
const updateVillage = asyncHandler(async (req, res) => {
  const village = await Village.findOneAndUpdate(
    { villageId: req.params.villageId.toLowerCase() },
    req.body,
    { new: true, runValidators: true }
  );
  if (!village) {
    res.status(404);
    throw new Error('Village not found');
  }
  res.status(200).json({ success: true, data: village });
});

// @desc    Delete a village (only if no bins reference it)
// @route   DELETE /api/villages/:villageId
// @access  Private (Admin)
const deleteVillage = asyncHandler(async (req, res) => {
  const villageId = req.params.villageId.toLowerCase();
  const binCount = await Bin.countDocuments({ villageId });
  if (binCount > 0) {
    res.status(409);
    throw new Error(`Cannot delete village: ${binCount} bin(s) still reference it`);
  }
  const village = await Village.findOneAndDelete({ villageId });
  if (!village) {
    res.status(404);
    throw new Error('Village not found');
  }
  res.status(200).json({ success: true, message: `Village '${villageId}' deleted` });
});

module.exports = { getVillages, createVillage, updateVillage, deleteVillage };
