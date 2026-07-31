const asyncHandler = require('express-async-handler');
const { applyFillLevel } = require('../utils/binEngine');

/**
 * @desc    Dedicated IoT ingest endpoint for ESP32 units. This is the ONLY
 *          route real hardware talks to. It does not use JWT auth (a
 *          microcontroller can't hold a logged-in session) — instead it
 *          trusts a shared secret sent in the "x-device-key" header,
 *          checked by the verifyDeviceKey middleware before this handler
 *          ever runs.
 *
 *          Body shape (exactly what the ESP32 sends):
 *            { "binId": "BIN-001", "fillLevel": 64 }
 *
 *          All the actual business logic (status recompute, crossing
 *          detection, notification creation, socket broadcast) lives in
 *          applyFillLevel() in utils/binEngine.js — this controller does
 *          NOT duplicate it, it just validates the payload and delegates.
 *
 * @route   POST /api/sensor/update
 * @access  Device (x-device-key header — see middleware/auth.js:verifyDeviceKey)
 */
const updateSensorReading = asyncHandler(async (req, res) => {
  const { binId, fillLevel } = req.body;

  if (!binId || typeof binId !== 'string') {
    res.status(400);
    throw new Error('binId is required and must be a string, e.g. "BIN-001"');
  }

  if (fillLevel === undefined || Number.isNaN(Number(fillLevel))) {
    res.status(400);
    throw new Error('fillLevel is required and must be a number between 0 and 100');
  }

  const numericFill = Number(fillLevel);
  if (numericFill < 0 || numericFill > 100) {
    res.status(400);
    throw new Error('fillLevel must be between 0 and 100');
  }

  // Reuses the exact same engine as the manual dashboard slider
  // (PATCH /api/bins/:binId/fill), so status thresholds, notification
  // generation, and socket.io broadcasts all behave identically whether
  // the update came from a human or a real sensor.
  const { bin, notification } = await applyFillLevel(binId, numericFill);

  res.status(200).json({
    success: true,
    message: `Reading accepted for ${bin.binId}`,
    data: {
      binId: bin.binId,
      fillLevel: bin.fillLevel,
      status: bin.status,
      sensorStatus: bin.sensorStatus,
      lastUpdated: bin.lastUpdated,
    },
    notification,
  });
});

module.exports = { updateSensorReading };
