'use client';

import { VM_OS_OPTIONS, type VmOs, type VmStatus } from '@repo/contracts';
import { RotateCcw, Search } from 'lucide-react';
import type { Ref } from 'react';

import { Button } from '../../components/ui/Button';
import { controlClasses, FieldLabel } from '../../components/ui/field';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { cn } from '../../lib/cn';
import type { VmFilters } from './lib/filter-vms';

function countLabel(matched: number, total: number, active: boolean): string {
  const vms = (n: number) => (n === 1 ? 'VM' : 'VMs');
  if (!active) {
    return `${total} ${vms(total)} en el inventario`;
  }
  return `${matched} de ${total} ${vms(total)} ${matched === 1 ? 'coincide' : 'coinciden'}`;
}

/**
 * Búsqueda por nombre y filtros de estado y SO. Filtra mientras se escribe; el recuento se
 * anuncia como estado y «Restablecer filtros» solo está activo cuando hay algo que limpiar.
 */
export function VmFiltersBar({
  filters,
  active,
  matched,
  total,
  onChange,
  onReset,
  searchRef,
}: {
  filters: VmFilters;
  active: boolean;
  matched: number;
  total: number;
  onChange: (patch: Partial<VmFilters>) => void;
  onReset: () => void;
  searchRef: Ref<HTMLInputElement>;
}) {
  return (
    <div
      role="search"
      aria-label="Filtrar máquinas virtuales"
      className="@container mb-4 flex flex-col gap-3"
    >
      {/* Distribución según el ancho real de la barra (container queries), no el del viewport:
       *  < 20rem: una columna · ≥ 20rem: búsqueda arriba + 2 filtros · ≥ 42rem: tres en fila. */}
      <div className="grid grid-cols-1 gap-3 @xs:grid-cols-2 @2xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-1.5 @xs:col-span-2 @2xl:col-span-1">
          <FieldLabel htmlFor="vm-search">Buscar por nombre</FieldLabel>
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              ref={searchRef}
              id="vm-search"
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              spellCheck={false}
              placeholder="p. ej. web-01"
              value={filters.q}
              onChange={(event) => onChange({ q: event.target.value })}
              className={cn(controlClasses(), 'pl-9 pr-3')}
            />
          </div>
        </div>
        <FilterSelect<'all' | VmStatus>
          label="Estado"
          value={filters.status}
          onChange={(status) => onChange({ status })}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'ON', label: 'Encendidas' },
            { value: 'OFF', label: 'Apagadas' },
          ]}
        />
        <FilterSelect<'all' | VmOs>
          label="Sistema operativo"
          value={filters.os}
          onChange={(os) => onChange({ os })}
          options={[
            { value: 'all', label: 'Todos' },
            ...VM_OS_OPTIONS.map((os) => ({ value: os, label: os })),
          ]}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-sm text-[var(--muted)]" data-vm-count>
          {countLabel(matched, total, active)}
        </p>
        <Button type="button" variant="ghost" size="sm" disabled={!active} onClick={onReset}>
          <RotateCcw aria-hidden className="size-4" />
          Restablecer filtros
        </Button>
      </div>
    </div>
  );
}
