const express = require('express');
const rateLimit = require('express-rate-limit');
const { verifyDeviceKey } = require('../middleware/auth');
const { updateSensorReading } = require('../controllers/sensorController');

const router = express.Router();

const deviceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/update',
  deviceLimiter,
  verifyDeviceKey,
  updateSensorReading
);

module.exports = router;