const { Server } = require('socket.io');
const logger = require('../config/logger');

let io = null;

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL, methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('subscribe', (room) => socket.join(room));
    socket.on('unsubscribe', (room) => socket.leave(room));
    socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
  });

  return io;
};

// Reusable emitter
const emit = (event, room, data) => {
  if (!io) return;
  if (room) io.to(room).emit(event, data);
  else io.emit(event, data);
};

module.exports = { init, emit };