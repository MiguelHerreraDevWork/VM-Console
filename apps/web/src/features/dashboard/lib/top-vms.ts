import type { Vm } from '@repo/contracts';

import type { Metric } from '../metrics';

export type TopVm = {
  id: string;
  name: string;
  os: string;
  value: number;
};

const metricField: Record<Metric, 'cores' | 'ram' | 'disk'> = {
  cores: 'cores',
  ramGb: 'ram',
  diskGb: 'disk',
};

/**
 * Las `limit` VMs encendidas con más asignación del recurso elegido (datos de GET /vms).
 * Excluye las apagadas y las que tienen un borrado optimista en vuelo, igual que las sumas.
 * Orden descendente por valor y, a igualdad, por nombre para que el orden sea estable.
 */
export function topVmsByMetric(
  vms: readonly (Vm & { pending?: string | undefined })[],
  metric: Metric,
  limit = 5,
): TopVm[] {
  const field = metricField[metric];
  return vms
    .filter((vm) => vm.status === 'ON' && vm.pending !== 'delete')
    .map((vm) => ({ id: vm.id, name: vm.name, os: vm.os, value: vm[field] }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'es'))
    .slice(0, limit);
}
