import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import logger from '../config/logger';

let io: Server | null = null;

export const init = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL, methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);
    socket.on('subscribe', (room: string) => socket.join(room));
    socket.on('unsubscribe', (room: string) => socket.leave(room));
    socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
  });

  return io;
};

export const emit = (event: string, room: string | null, data: unknown): void => {
  if (!io) return;
  if (room) io.to(room).emit(event, data);
  else io.emit(event, data);
};