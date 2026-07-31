const asyncHandler = require('express-async-handler');
const Bin = require('../models/Bin');
const { applyFillLevel } = require('../utils/binEngine');

// In-memory handle for the auto-simulation interval. A single global timer
// is fine for a demo app (one dashboard, one simulated village network).
let simulationInterval = null;

// @desc    Real ESP32 ingest endpoint. A device POSTs exactly what the
//          hardware sends: { "binId": "BIN-023", "fillLevel": 95 }.
//          Auth is a shared device key (x-device-key header), not a user
//          JWT, since the ESP32 can't hold a login session.
// @route   POST /api/esp32/data
// @access  Device (x-device-key header)
const ingestSensorReading = asyncHandler(async (req, res) => {
  const { binId, fillLevel } = req.body;

  if (!binId || fillLevel === undefined || Number.isNaN(Number(fillLevel))) {
    res.status(400);
    throw new Error('Payload must include binId and a numeric fillLevel (0-100)');
  }

  const { bin, notification } = await applyFillLevel(binId, Number(fillLevel));
  res.status(200).json({ success: true, data: bin, notification });
});

// @desc    Start server-side Auto Simulation: every tick, nudge a handful
//          of random online bins upward, exactly like real ultrasonic
//          sensors reporting gradually rising fill levels. Mirrors the
//          frontend's AppContext auto-simulation but runs on the server so
//          it keeps updating every connected dashboard via Socket.io.
// @route   POST /api/simulation/start
// @access  Private (Admin, Officer)
const startAutoSimulation = asyncHandler(async (req, res) => {
  if (simulationInterval) {
    return res.status(200).json({ success: true, message: 'Auto simulation already running' });
  }

  simulationInterval = setInterval(async () => {
    try {
      const onlineBins = await Bin.find({ sensorStatus: 'Online', fillLevel: { $lt: 100 } });
      if (!onlineBins.length) return;
      const sampleSize = Math.min(4, onlineBins.length);
      const shuffled = [...onlineBins].sort(() => Math.random() - 0.5).slice(0, sampleSize);
      await Promise.all(
        shuffled.map((b) =>
          applyFillLevel(b.binId, Math.min(100, b.fillLevel + Math.ceil(Math.random() * 9)))
        )
      );
    } catch (err) {
      console.error('Auto simulation tick failed:', err.message);
    }
  }, 2500);

  res.status(200).json({ success: true, message: 'Auto simulation started' });
});

// @desc    Stop server-side Auto Simulation
// @route   POST /api/simulation/stop
// @access  Private (Admin, Officer)
const stopAutoSimulation = asyncHandler(async (req, res) => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  res.status(200).json({ success: true, message: 'Auto simulation stopped' });
});

// @desc    Current auto-simulation status
// @route   GET /api/simulation/status
// @access  Private
const getSimulationStatus = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, running: !!simulationInterval });
});

module.exports = { ingestSensorReading, startAutoSimulation, stopAutoSimulation, getSimulationStatus };
