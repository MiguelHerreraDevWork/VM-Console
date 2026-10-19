import { VM_OS_OPTIONS, type Vm, type VmOs, type VmStatus } from '@repo/contracts';

export type VmFilters = {
  /** Texto buscado en el nombre (sin distinguir mayúsculas ni acentos). */
  q: string;
  status: 'all' | VmStatus;
  os: 'all' | VmOs;
};

export const emptyVmFilters: VmFilters = { q: '', status: 'all', os: 'all' };

/** Minúsculas, sin marcas diacríticas y con espacios reducidos: «Ñandú  01» → «nandu 01». */
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('es')
    .trim()
    .replace(/\s+/g, ' ');
}

export function hasActiveVmFilters(filters: VmFilters): boolean {
  return normalizeSearch(filters.q) !== '' || filters.status !== 'all' || filters.os !== 'all';
}

/**
 * Filtro en cliente sobre la caché de GET /vms: como se aplica a los datos de la caché,
 * responde igual a cambios optimistas y eventos en tiempo real. Conserva el orden recibido.
 */
export function filterVms<T extends Pick<Vm, 'name' | 'status' | 'os'>>(
  vms: readonly T[],
  filters: VmFilters,
): T[] {
  const q = normalizeSearch(filters.q);
  return vms.filter(
    (vm) =>
      (q === '' || normalizeSearch(vm.name).includes(q)) &&
      (filters.status === 'all' || vm.status === filters.status) &&
      (filters.os === 'all' || vm.os === filters.os),
  );
}

/** Lee filtros de la URL descartando valores desconocidos (enlaces editados a mano). */
export function vmFiltersFromParams(params: Pick<URLSearchParams, 'get'>): VmFilters {
  const status = params.get('estado');
  const os = params.get('so');
  return {
    q: params.get('q') ?? '',
    status: status === 'ON' || status === 'OFF' ? status : 'all',
    os: VM_OS_OPTIONS.includes(os as VmOs) ? (os as VmOs) : 'all',
  };
}

export function vmFiltersToQuery(filters: VmFilters): string {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.status !== 'all') params.set('estado', filters.status);
  if (filters.os !== 'all') params.set('so', filters.os);
  const query = params.toString();
  return query ? `?${query}` : '';
}
