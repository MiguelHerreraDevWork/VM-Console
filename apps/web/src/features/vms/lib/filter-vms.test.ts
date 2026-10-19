import type { Vm } from '@repo/contracts';
import { describe, expect, it } from 'vitest';

import {
  emptyVmFilters,
  filterVms,
  hasActiveVmFilters,
  vmFiltersFromParams,
  vmFiltersToQuery,
} from './filter-vms';

type Row = Pick<Vm, 'name' | 'status' | 'os'>;
const rows: Row[] = [
  { name: 'web-frontend-01', status: 'ON', os: 'Ubuntu' },
  { name: 'Ñandú staging', status: 'OFF', os: 'Ubuntu' },
  { name: 'db-primary-01', status: 'ON', os: 'Rocky Linux' },
  { name: 'legacy-windows-01', status: 'OFF', os: 'Windows Server' },
];
const names = (list: Row[]) => list.map((r) => r.name);

describe('filterVms', () => {
  it('sin filtros devuelve todo en el mismo orden', () => {
    expect(filterVms(rows, emptyVmFilters)).toEqual(rows);
  });

  it('busca por nombre sin distinguir mayúsculas ni acentos', () => {
    expect(names(filterVms(rows, { ...emptyVmFilters, q: 'nandu' }))).toEqual(['Ñandú staging']);
    expect(names(filterVms(rows, { ...emptyVmFilters, q: '  WEB ' }))).toEqual(['web-frontend-01']);
  });

  it('combina estado y sistema operativo', () => {
    expect(names(filterVms(rows, { ...emptyVmFilters, status: 'ON' }))).toEqual([
      'web-frontend-01',
      'db-primary-01',
    ]);
    expect(names(filterVms(rows, { q: '01', status: 'OFF', os: 'Windows Server' }))).toEqual([
      'legacy-windows-01',
    ]);
    expect(filterVms(rows, { q: 'db', status: 'OFF', os: 'all' })).toEqual([]);
  });
});

describe('estado de filtros', () => {
  it('detecta si hay filtros activos (espacios no cuentan)', () => {
    expect(hasActiveVmFilters(emptyVmFilters)).toBe(false);
    expect(hasActiveVmFilters({ ...emptyVmFilters, q: '   ' })).toBe(false);
    expect(hasActiveVmFilters({ ...emptyVmFilters, os: 'Debian' })).toBe(true);
  });

  it('ida y vuelta con la URL, descartando valores desconocidos', () => {
    const query = vmFiltersToQuery({ q: 'web', status: 'ON', os: 'Rocky Linux' });
    expect(vmFiltersFromParams(new URLSearchParams(query))).toEqual({
      q: 'web',
      status: 'ON',
      os: 'Rocky Linux',
    });
    expect(vmFiltersFromParams(new URLSearchParams('estado=RUNNING&so=MacOS'))).toEqual(
      emptyVmFilters,
    );
    expect(vmFiltersToQuery(emptyVmFilters)).toBe('');
  });
});
