import type { Vm } from '@repo/contracts';

export type VmPending = 'create' | 'update' | 'delete';

/** VM en caché de UI; `pending` no se envía a la API. */
export type VmView = Vm & { pending?: VmPending };

export function isTempVmId(id: string): boolean {
  return id.startsWith('temp-');
}

export function isVmBusy(vm: VmView): boolean {
  return Boolean(vm.pending) || isTempVmId(vm.id);
}
