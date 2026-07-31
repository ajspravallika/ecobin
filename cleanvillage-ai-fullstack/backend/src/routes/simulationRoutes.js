const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  ingestSensorReading,
  startAutoSimulation,
  stopAutoSimulation,
  getSimulationStatus,
} = require('../controllers/simulationController');
const { protect, authorize, verifyDeviceKey } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

// The real ESP32 devices could send readings fairly often; cap it so a
// misbehaving or compromised device can't hammer the API.
const deviceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// Real hardware ingest — auth'd with a shared device key, not a user JWT.
router.post('/esp32/data', deviceLimiter, verifyDeviceKey, ingestSensorReading);

// Dashboard demo controls — auth'd as a normal logged-in Admin/Officer.
router.post('/simulation/start', protect, authorize(ROLES.ADMIN, ROLES.OFFICER), startAutoSimulation);
router.post('/simulation/stop', protect, authorize(ROLES.ADMIN, ROLES.OFFICER), stopAutoSimulation);
router.get('/simulation/status', protect, getSimulationStatus);

module.exports = router;
