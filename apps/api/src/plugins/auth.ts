import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { SESSION_COOKIE_NAME, type Role, type SessionUser } from '@repo/contracts';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import { getConfig } from '../config.js';
import { HttpError } from '../lib/http-error.js';
import { expiresInToSeconds } from '../lib/jwt-expiry.js';
import { getSessionUserById } from '../modules/auth/service.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { role: Role };
    user: { sub: string; role: Role };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (
      role: Role,
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    setSessionCookie: (reply: FastifyReply, token: string) => void;
    clearSessionCookie: (reply: FastifyReply) => void;
  }

  interface FastifyRequest {
    currentUser: SessionUser;
  }
}

async function loadCurrentUser(request: FastifyRequest): Promise<SessionUser> {
  try {
    await request.jwtVerify();
  } catch {
    throw new HttpError('UNAUTHENTICATED', 'Sesión no válida o ausente');
  }

  const sessionUser = await getSessionUserById(request.user.sub);
  if (!sessionUser) {
    throw new HttpError('UNAUTHENTICATED', 'Sesión no válida o ausente');
  }

  request.currentUser = sessionUser;
  return sessionUser;
}

async function authPlugin(app: FastifyInstance) {
  const config = getConfig();
  const maxAge = expiresInToSeconds(config.JWT_EXPIRES_IN);

  await app.register(cookie);
  await app.register(jwt, {
    secret: config.JWT_SECRET,
    cookie: {
      cookieName: SESSION_COOKIE_NAME,
      signed: false,
    },
  });

  app.decorate('setSessionCookie', (reply: FastifyReply, token: string) => {
    reply.setCookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });
  });

  app.decorate('clearSessionCookie', (reply: FastifyReply) => {
    reply.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
  });

  app.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
    await loadCurrentUser(request);
  });

  app.decorate('requireRole', (role: Role) => {
    return async (request: FastifyRequest, _reply: FastifyReply) => {
      const user = await loadCurrentUser(request);
      if (user.role !== role) {
        throw new HttpError('FORBIDDEN', 'No tienes permiso para esta acción');
      }
    };
  });
}

export const authPluginFp = fp(authPlugin, { name: 'auth-plugin' });
