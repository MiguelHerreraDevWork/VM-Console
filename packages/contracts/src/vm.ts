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
        .regex(VM_NAME_PATTERN, 'El nombre solo admite letras, números, espacios y guion'),
    ),
  cores: z
    .number({
      required_error: 'Indica el número de vCPU',
      invalid_type_error: 'Indica el número de vCPU',
    })
    .int('Las vCPU deben ser un número entero')
    .min(1, 'Mínimo 1 vCPU')
    .max(64, 'Máximo 64 vCPU'),
  ram: z
    .number({
      required_error: 'Indica la RAM en GB',
      invalid_type_error: 'Indica la RAM en GB',
    })
    .int('La RAM debe ser un número entero de GB')
    .min(1, 'La RAM mínima es 1 GB')
    .max(512, 'La RAM máxima es 512 GB'),
  disk: z
    .number({
      required_error: 'Indica el disco en GB',
      invalid_type_error: 'Indica el disco en GB',
    })
    .int('El disco debe ser un número entero de GB')
    .min(10, 'El disco mínimo es 10 GB')
    .max(4096, 'El disco máximo es 4096 GB'),
  os: z.enum(VM_OS_OPTIONS, {
    errorMap: () => ({ message: 'Elige un sistema operativo de la lista' }),
  }),
  status: z.enum(VM_STATUSES, {
    errorMap: () => ({ message: 'El estado debe ser Encendida o Apagada' }),
  }),
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
