const { Server } = require('socket.io');

let io;

/**
 * Initializes Socket.io on top of the HTTP server. Called once from
 * server.js. Emits three event types that the React dashboard subscribes
 * to, so "Dashboard updates automatically" (from the workflow) is a real
 * push instead of polling:
 *
 *   bin:update           - a single bin document changed (fill level,
 *                           status, sensor status, collected, etc.)
 *   notification:new     - a bin crossed into Almost Full / Full
 *   stats:update         - aggregate dashboard counters changed
 */
function initSocket(server, corsOrigin) {
  io = new Server(server, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket(server) first.');
  }
  return io;
}

// Safe emit helpers — no-op (with a warning) if sockets aren't initialized
// yet, so controllers never have to guard every call.
function emitBinUpdate(bin) {
  if (io) io.emit('bin:update', bin);
}

function emitNewNotification(notification) {
  if (io) io.emit('notification:new', notification);
}

function emitStatsUpdate(stats) {
  if (io) io.emit('stats:update', stats);
}

module.exports = { initSocket, getIO, emitBinUpdate, emitNewNotification, emitStatsUpdate };
