import type { Role } from '@repo/contracts';

export type Action = 'vm:create' | 'vm:edit' | 'vm:delete' | 'vm:toggle';

const adminOnly: Action[] = ['vm:create', 'vm:edit', 'vm:delete', 'vm:toggle'];

export function can(role: Role | undefined, action: Action): boolean {
  if (!role) {
    return false;
  }
  if (adminOnly.includes(action)) {
    return role === 'ADMIN';
  }
  return true;
}
