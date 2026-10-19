import { z } from 'zod';

import { ROLES } from './constants.js';

export const loginInputSchema = z.object({
  email: z.string().trim().email('Email inválido').transform((v) => v.toLowerCase()),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const sessionUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(ROLES),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;

export const sessionResponseSchema = z.object({
  user: sessionUserSchema,
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;
