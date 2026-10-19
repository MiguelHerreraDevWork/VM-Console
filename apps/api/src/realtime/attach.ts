import { SESSION_COOKIE_NAME, type Role } from '@repo/contracts';
import type { FastifyInstance } from 'fastify';
import { Server } from 'socket.io';

import { getConfig } from '../config.js';
import { getSessionUserById } from '../modules/auth/service.js';
import { readCookieValue } from './cookie.js';
import { setRealtimeServer } from './hub.js';

type JwtPayload = {
  sub: string;
  role: Role;
  exp?: number;
};

/**
 * Attach Socket.IO to the Fastify HTTP server.
 * Call after `app.ready()` (server exists) and before or after `listen`.
 */
export function attachRealtime(app: FastifyInstance): Server {
  const config = getConfig();
  const io = new Server(app.server, {
    cors: {
      origin: config.WEB_ORIGIN,
      credentials: true,
    },
    serveClient: false,
  });

  io.use(async (socket, next) => {
    try {
      const origin = socket.request.headers.origin;
      if (origin !== config.WEB_ORIGIN) {
        next(new Error('UNAUTHENTICATED'));
        return;
      }

      const token = readCookieValue(socket.request.headers.cookie, SESSION_COOKIE_NAME);
      if (!token) {
        next(new Error('UNAUTHENTICATED'));
        return;
      }

      let payload: JwtPayload;
      try {
        payload = app.jwt.verify<JwtPayload>(token);
      } catch {
        next(new Error('UNAUTHENTICATED'));
        return;
      }

      const user = await getSessionUserById(payload.sub);
      if (!user) {
        next(new Error('UNAUTHENTICATED'));
        return;
      }

      socket.data.user = user;

      if (typeof payload.exp === 'number') {
        const delayMs = payload.exp * 1000 - Date.now();
        if (delayMs <= 0) {
          next(new Error('UNAUTHENTICATED'));
          return;
        }
        const timer = setTimeout(() => {
          socket.disconnect(true);
        }, delayMs);
        socket.on('disconnect', () => {
          clearTimeout(timer);
        });
      }

      next();
    } catch {
      next(new Error('UNAUTHENTICATED'));
    }
  });

  io.on('connection', (socket) => {
    // Clients only receive; ignore any inbound events.
    socket.onAny(() => {
      /* no-op */
    });
  });

  setRealtimeServer(io);
  // Use the HTTP server `close` event (works before/after listen; avoids Fastify addHook limits).
  app.server.once('close', () => {
    setRealtimeServer(null);
    void io.close();
  });

  return io;
}
