import { vmWriteSchema } from '@repo/contracts';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { createVm, deleteVm, listVms, updateVm } from './service.js';

const idParamSchema = z.object({
  id: z.string().uuid('El id debe ser un UUID'),
});

export async function vmRoutes(app: FastifyInstance) {
  app.get(
    '/vms',
    {
      preValidation: [app.authenticate],
    },
    async () => listVms(),
  );

  app.post(
    '/vms',
    {
      preValidation: [app.requireRole('ADMIN')],
    },
    async (request, reply) => {
      const body = vmWriteSchema.parse(request.body);
      const vm = await createVm(body);
      return reply.status(201).send(vm);
    },
  );

  app.put(
    '/vms/:id',
    {
      preValidation: [app.requireRole('ADMIN')],
    },
    async (request) => {
      const { id } = idParamSchema.parse(request.params);
      const body = vmWriteSchema.parse(request.body);
      return updateVm(id, body);
    },
  );

  app.delete(
    '/vms/:id',
    {
      preValidation: [app.requireRole('ADMIN')],
    },
    async (request, reply) => {
      const { id } = idParamSchema.parse(request.params);
      await deleteVm(id);
      return reply.status(204).send();
    },
  );
}
