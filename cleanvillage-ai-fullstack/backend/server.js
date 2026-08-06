require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const path = require('path');
const fs = require('fs');

const connectDB = require('./src/config/db');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');
const { initSocket } = require('./src/socket');
const { syncWorkersFromUsers } = require('./src/utils/workerSync');

const authRoutes = require('./src/routes/authRoutes');
const binRoutes = require('./src/routes/binRoutes');
const villageRoutes = require('./src/routes/villageRoutes');
const workerRoutes = require('./src/routes/workerRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const historyRoutes = require('./src/routes/historyRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const simulationRoutes = require('./src/routes/simulationRoutes');
const sensorRoutes = require('./src/routes/sensorRoutes');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ---- Core middleware ----
app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Generic API rate limit (a separate, stricter limiter is applied to the
// ESP32 ingest route in sensorRoutes.js).
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, service: 'CleanVillage AI API', status: 'ok', time: new Date().toISOString() });
});

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/bins', binRoutes);
app.use('/api/villages', villageRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', simulationRoutes); // exposes /api/simulation/* (fake/demo data only)
app.use('/api/sensor', sensorRoutes); // exposes POST /api/sensor/update — real ESP32 ingest

// ---- Serve the React build (only relevant if this backend is ALSO used to
// host the frontend, e.g. a single-service Render deploy instead of a
// separate Static Site). If frontend/dist doesn't exist (the normal case
// when frontend is deployed separately with VITE_API_URL pointing here),
// this block is a silent no-op and every request falls through to the
// normal /api routes + notFound handler below untouched.
//
// This is what actually fixes "refresh on /dashboard, /bins, etc. shows
// 404" for a same-service deploy: any GET that isn't /api/* is handed
// index.html so React Router can take over and resolve the route
// client-side, instead of Express (or Render) returning a bare 404 for a
// path it has no route for.
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// ---- Error handling ----
app.use(notFound);
app.use(errorHandler);

// ---- Socket.io (real-time bin/notification/stats push) ----
initSocket(server, CLIENT_URL);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // One-time backfill so pre-existing worker accounts (created before this
  // fix) immediately show up in the Assign Worker dropdown — see
  // src/utils/workerSync.js for the full explanation.
  await syncWorkersFromUsers();

  server.listen(PORT, () => {
    console.log(`CleanVillage AI backend running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server };