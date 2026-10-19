import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { ZodError } from 'zod';

import { HttpError, toErrorBody } from '../lib/http-error.js';

async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send(toErrorBody(error));
    }

    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      const httpError = new HttpError('VALIDATION_ERROR', 'Datos inválidos', details);
      return reply.status(httpError.statusCode).send(toErrorBody(httpError));
    }

    const errObj =
      typeof error === 'object' && error !== null
        ? (error as { statusCode?: number; code?: string })
        : undefined;
    const statusCode = typeof errObj?.statusCode === 'number' ? errObj.statusCode : undefined;
    const fastifyCode = typeof errObj?.code === 'string' ? errObj.code : undefined;

    if (
      statusCode === 400 ||
      fastifyCode === 'FST_ERR_CTP_INVALID_JSON_BODY' ||
      fastifyCode === 'FST_ERR_CTP_EMPTY_JSON_BODY'
    ) {
      const httpError = new HttpError('VALIDATION_ERROR', 'Cuerpo JSON inválido');
      return reply.status(400).send(toErrorBody(httpError));
    }

    if (statusCode === 429) {
      const httpError = new HttpError('RATE_LIMITED', 'Demasiados intentos de inicio de sesión');
      return reply.status(429).send(toErrorBody(httpError));
    }

    if (statusCode === 404) {
      const httpError = new HttpError('NOT_FOUND', 'Recurso no encontrado');
      return reply.status(404).send(toErrorBody(httpError));
    }

    request.log.error({ err: error }, 'Unhandled error');
    const httpError = new HttpError('INTERNAL_ERROR', 'Error interno del servidor');
    return reply.status(500).send(toErrorBody(httpError));
  });

  app.setNotFoundHandler((_request, reply) => {
    const httpError = new HttpError('NOT_FOUND', 'Ruta no encontrada');
    return reply.status(404).send(toErrorBody(httpError));
  });
}

export const errorHandlerPluginFp = fp(errorHandlerPlugin, { name: 'error-handler-plugin' });
