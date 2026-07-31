const asyncHandler = require('express-async-handler');
const Bin = require('../models/Bin');
const { applyFillLevel } = require('../utils/binEngine');

// In-memory handle for the auto-simulation interval. A single global timer
// is fine for a demo app (one dashboard, one simulated village network).
//
// NOTE: Real sensor ingest used to live in this file as
// `ingestSensorReading` (POST /api/esp32/data). It has moved to its own
// dedicated module — src/controllers/sensorController.js, mounted at
// POST /api/sensor/update — so the "demo/simulation" concern and the
// "real hardware ingest" concern are cleanly separated. This file now
// only contains the fake/demo auto-simulation used when no real ESP32 is
// connected.
let simulationInterval = null;

// @desc    Start server-side Auto Simulation: every tick, nudge a handful
//          of random online bins upward, exactly like real ultrasonic
//          sensors reporting gradually rising fill levels. Mirrors the
//          frontend's AppContext auto-simulation but runs on the server so
//          it keeps updating every connected dashboard via Socket.io.
//          Turn this OFF once real ESP32 hardware is reporting, otherwise
//          the demo simulation and the real sensor will fight over the
//          same bins.
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

module.exports = {
  startAutoSimulation,
  stopAutoSimulation,
  getSimulationStatus,
};
