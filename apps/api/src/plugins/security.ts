import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

import { getConfig } from '../config.js';
import { HttpError } from '../lib/http-error.js';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export type SecurityOptions = {
  loginMax?: number;
  loginTimeWindow?: string;
};

async function securityPlugin(app: FastifyInstance, _opts: SecurityOptions) {
  const config = getConfig();

  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: false,
  });

  await app.register(rateLimit, {
    global: false,
  });

  app.addHook('onRequest', async (request) => {
    if (!MUTATING_METHODS.has(request.method)) {
      return;
    }
    const origin = request.headers.origin;
    if (origin && origin !== config.WEB_ORIGIN) {
      throw new HttpError('ORIGIN_NOT_ALLOWED', 'Origin no permitido');
    }
  });
}

export const securityPluginFp = fp(securityPlugin, { name: 'security-plugin' });
