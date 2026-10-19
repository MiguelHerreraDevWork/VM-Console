import { z } from 'zod';

import { VM_OS_OPTIONS, VM_STATUSES } from './constants.js';
import { normalizeVmName } from './vm-name.js';

const VM_NAME_PATTERN = /^[\p{L}\p{M}0-9 -]+$/u;

export const vmInputSchema = z.object({
  name: z
    .string()
    .transform(normalizeVmName)
    .pipe(
      z
        .string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(50, 'El nombre no puede superar 50 caracteres')
        .regex(
          VM_NAME_PATTERN,
          'El nombre solo admite letras, números, espacios y guion',
        ),
    ),
  cores: z
    .number({ invalid_type_error: 'cores debe ser un número' })
    .int('cores debe ser un entero')
    .min(1, 'cores mínimo: 1')
    .max(64, 'cores máximo: 64'),
  ram: z
    .number({ invalid_type_error: 'ram debe ser un número' })
    .int('ram debe ser un entero')
    .min(1, 'ram mínimo: 1 GB')
    .max(512, 'ram máximo: 512 GB'),
  disk: z
    .number({ invalid_type_error: 'disk debe ser un número' })
    .int('disk debe ser un entero')
    .min(10, 'disk mínimo: 10 GB')
    .max(4096, 'disk máximo: 4096 GB'),
  os: z.enum(VM_OS_OPTIONS),
  status: z.enum(VM_STATUSES),
});

export type VmInput = z.infer<typeof vmInputSchema>;

/** Full writable payload; rejects unknown keys (PUT). */
export const vmWriteSchema = vmInputSchema.strict();

export type VmWrite = z.infer<typeof vmWriteSchema>;

export const vmSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  cores: z.number().int(),
  ram: z.number().int(),
  disk: z.number().int(),
  os: z.enum(VM_OS_OPTIONS),
  status: z.enum(VM_STATUSES),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Vm = z.infer<typeof vmSchema>;

export const vmListResponseSchema = z.object({
  items: z.array(vmSchema),
});

export type VmListResponse = z.infer<typeof vmListResponseSchema>;
