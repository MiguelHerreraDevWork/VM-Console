import Fastify, { type FastifyInstance } from 'fastify';

import { prisma } from './db.js';
import { authRoutes } from './modules/auth/routes.js';
import { vmRoutes } from './modules/vms/routes.js';
import { authPluginFp } from './plugins/auth.js';
import { errorHandlerPluginFp } from './plugins/error-handler.js';
import { securityPluginFp, type SecurityOptions } from './plugins/security.js';

export type BuildAppOptions = SecurityOptions & {
  bodyLimit?: number;
};

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    bodyLimit: options.bodyLimit ?? 1024 * 100,
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      redact: {
        paths: [
          'req.headers.cookie',
          'req.headers.authorization',
          'res.headers["set-cookie"]',
          'password',
          'body.password',
        ],
        remove: true,
      },
    },
  });

  const securityOpts: SecurityOptions = {};
  if (options.loginMax !== undefined) {
    securityOpts.loginMax = options.loginMax;
  }
  if (options.loginTimeWindow !== undefined) {
    securityOpts.loginTimeWindow = options.loginTimeWindow;
  }

  await app.register(errorHandlerPluginFp);
  await app.register(securityPluginFp, securityOpts);
  await app.register(authPluginFp);
  await app.register(async (instance) => {
    await authRoutes(instance, securityOpts);
  });
  await app.register(vmRoutes);

  app.get('/health', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch {
      return reply.status(503).send({ status: 'unavailable' });
    }
  });

  return app;
}
