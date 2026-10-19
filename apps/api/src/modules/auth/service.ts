import type { Role, SessionUser } from '@repo/contracts';

import { DUMMY_PASSWORD_HASH, verifyPassword } from '../../auth/password.js';
import { prisma } from '../../db.js';
import { HttpError } from '../../lib/http-error.js';

const INVALID_CREDENTIALS_MESSAGE = 'Email o contraseña incorrectos';

export async function authenticateUser(
  email: string,
  password: string,
): Promise<SessionUser> {
  const user = await prisma.user.findUnique({ where: { email } });

  const hash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const valid = await verifyPassword(hash, password);

  if (!user || !valid) {
    throw new HttpError('INVALID_CREDENTIALS', INVALID_CREDENTIALS_MESSAGE);
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role as Role,
  };
}

export async function getSessionUserById(id: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true },
  });
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    email: user.email,
    role: user.role as Role,
  };
}
