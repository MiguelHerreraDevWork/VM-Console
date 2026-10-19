import { loginInputSchema } from '@repo/contracts';
import type { FastifyInstance } from 'fastify';

import { getConfig } from '../../config.js';
import { HttpError, toErrorBody } from '../../lib/http-error.js';
import type { SecurityOptions } from '../../plugins/security.js';
import { authenticateUser } from './service.js';

export async function authRoutes(app: FastifyInstance, opts: SecurityOptions = {}) {
  app.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: opts.loginMax ?? 10,
          timeWindow: opts.loginTimeWindow ?? '1 minute',
          errorResponseBuilder: () => ({
            statusCode: 429,
            ...toErrorBody(
              new HttpError('RATE_LIMITED', 'Demasiados intentos de inicio de sesión'),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const body = loginInputSchema.parse(request.body);
      const user = await authenticateUser(body.email, body.password);
      const config = getConfig();

      const token = app.jwt.sign(
        { role: user.role },
        { sub: user.id, expiresIn: config.JWT_EXPIRES_IN },
      );

      app.setSessionCookie(reply, token);
      return { user };
    },
  );

  app.get('/me', { preHandler: [app.authenticate] }, async (request) => {
    return { user: request.currentUser };
  });

  app.post('/logout', { preHandler: [app.authenticate] }, async (_request, reply) => {
    app.clearSessionCookie(reply);
    return reply.status(204).send();
  });
}
