import { hashPassword } from '../auth/password.js';
import { prisma } from '../db.js';

export async function resetAuthFixtures() {
  await prisma.vm.deleteMany();
  await prisma.user.deleteMany();
}

export async function createUser(input: {
  email: string;
  password: string;
  role: 'ADMIN' | 'CLIENT';
}) {
  return prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash: await hashPassword(input.password),
      role: input.role,
    },
  });
}

export function cookieFromResponse(setCookie: string | string[] | undefined): string | undefined {
  const header = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  if (!header) {
    return undefined;
  }
  return header.split(';')[0];
}
