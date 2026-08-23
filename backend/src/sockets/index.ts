import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import cookie from 'cookie';
import { verifyToken } from '../utils/jwt';
import { env } from '../config/env';
import { IQuestion } from '../models/Question';

let io: Server | null = null;

/**
 * Rooms:
 *  - `admins`            all connected admins (dashboard + live session + unanswered feed)
 *  - `user:<userId>`     a single user's own devices, for answer notifications
 */
export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      const tokenFromCookie = rawCookie ? cookie.parse(rawCookie)[env.COOKIE_NAME] : undefined;
      const tokenFromAuth = socket.handshake.auth?.token as string | undefined;
      const token = tokenFromCookie || tokenFromAuth;

      if (!token) return next(new Error('Unauthorized'));

      const payload = verifyToken(token);
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    if (user.role === 'admin') {
      socket.join('admins');
    }
    socket.join(`user:${user.id}`);

    socket.on('disconnect', () => {
      // no-op; rooms are cleaned up automatically
    });
  });

  return io;
};

const getIO = (): Server => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

// Serialize just what the client needs, respecting anonymity, so we never
// broadcast a name for an anonymous question over the wire either.
const serializeForBroadcast = (question: IQuestion) => {
  const obj = question.toJSON() as any;
  return obj;
};

export const emitNewQuestion = (question: IQuestion): void => {
  getIO().to('admins').emit('question:new', serializeForBroadcast(question));
};

export const emitQuestionAnswered = (question: IQuestion): void => {
  const payload = serializeForBroadcast(question);
  getIO().to('admins').emit('question:answered', payload);
  getIO().to(`user:${question.userId.toString()}`).emit('question:answered', payload);
};

export const emitQuestionUpdated = (question: IQuestion): void => {
  const payload = serializeForBroadcast(question);
  getIO().to('admins').emit('question:updated', payload);
  getIO().to(`user:${question.userId.toString()}`).emit('question:updated', payload);
};
