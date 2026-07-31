const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Verifies the JWT (from Authorization: Bearer <token> or cookie) and
// attaches the user document to req.user.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401);
      throw new Error('Not authorized, user no longer exists or is disabled');
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, token invalid or expired');
  }
});

// Usage: authorize('Administrator', 'Municipality Officer')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Role '${req.user ? req.user.role : 'guest'}' is not permitted to perform this action`);
  }
  next();
};

// Shared-secret auth for IoT devices (ESP32 units) hitting the ingest
// endpoint. Devices can't hold a user JWT, so they send a static header
// key instead, validated against DEVICE_API_KEY.
const verifyDeviceKey = (req, res, next) => {
  const key = req.headers['x-device-key'];
  if (!key || key !== process.env.DEVICE_API_KEY) {
    res.status(401);
    throw new Error('Invalid or missing device API key');
  }
  next();
};

module.exports = { protect, authorize, verifyDeviceKey };
