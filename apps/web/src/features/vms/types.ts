import type { Vm } from '@repo/contracts';

/** Operación optimista en vuelo sobre una VM (solo UI; nunca se envía a la API). */
export type VmPending = 'create' | 'update' | 'power-on' | 'power-off' | 'delete';

/** VM en caché de UI; `pending` no se envía a la API. */
export type VmView = Vm & { pending?: VmPending };

const pendingLabels: Record<VmPending, string> = {
  create: 'Creando…',
  update: 'Guardando cambios…',
  'power-on': 'Encendiendo…',
  'power-off': 'Apagando…',
  delete: 'Eliminando…',
};

export function pendingLabel(pending: VmPending): string {
  return pendingLabels[pending];
}

export function isTempVmId(id: string): boolean {
  return id.startsWith('temp-');
}

/** Una VM con operación en vuelo no admite otra acción que pueda entrar en conflicto. */
export function isVmBusy(vm: VmView): boolean {
  return Boolean(vm.pending) || isTempVmId(vm.id);
}
