import type { Role, VmStatus } from '@repo/contracts';

export function roleLabel(role: Role): string {
  return role === 'ADMIN' ? 'Administrador' : 'Cliente';
}

export function statusLabel(status: VmStatus): string {
  return status === 'ON' ? 'Encendida' : 'Apagada';
}
