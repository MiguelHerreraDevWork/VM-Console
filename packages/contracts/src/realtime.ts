import { z } from 'zod';

import { vmSchema } from './vm.js';

/** Socket.IO event name for VM status changes. */
export const VM_UPDATED_EVENT = 'vm:updated' as const;

export const vmUpdatedPayloadSchema = z.object({
  vm: vmSchema,
});

export type VmUpdatedPayload = z.infer<typeof vmUpdatedPayloadSchema>;
