const express = require('express');
const {
  startAutoSimulation,
  stopAutoSimulation,
  getSimulationStatus,
} = require('../controllers/simulationController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

// Demo/fake-data controls only. Real ESP32 ingest now lives at
// POST /api/sensor/update (see src/routes/sensorRoutes.js).
router.post('/simulation/start', protect, authorize(ROLES.ADMIN, ROLES.OFFICER), startAutoSimulation);
router.post('/simulation/stop', protect, authorize(ROLES.ADMIN, ROLES.OFFICER), stopAutoSimulation);
router.get('/simulation/status', protect, getSimulationStatus);

module.exports = router;
