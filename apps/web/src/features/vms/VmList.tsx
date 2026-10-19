'use client';

import { RotateCcw, SearchX, ServerOff } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { viewMeta } from '../../components/layout/nav';
import { ViewLoading } from '../../components/layout/ViewLoading';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useSession } from '../auth/hooks';
import { useVmsQuery } from './hooks';
import { filterVms, hasActiveVmFilters, type VmFilters } from './lib/filter-vms';
import { NewVmButton } from './NewVmButton';
import { useVmFilters } from './useVmFilters';
import { VmCard } from './VmCard';
import { VmFiltersBar } from './VmFiltersBar';
import { VmListSkeleton } from './VmListSkeleton';
import { VmTable } from './VmTable';

function describeFilters({ q, status, os }: VmFilters): string {
  return [
    q.trim() ? `nombre con «${q.trim()}»` : null,
    // Mismo texto que la opción elegida en el filtro de estado.
    status === 'ON' ? 'encendidas' : status === 'OFF' ? 'apagadas' : null,
    os !== 'all' ? os : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

export function VmList() {
  const { isAdmin } = useSession();
  const query = useVmsQuery();
  const { filters, update, reset } = useVmFilters();
  const searchRef = useRef<HTMLInputElement>(null);

  // Se filtra la caché de GET /vms en cada render: los cambios optimistas y los eventos en
  // tiempo real entran o salen de los resultados sin lógica adicional.
  const items = query.data;
  const visible = useMemo(() => filterVms(items ?? [], filters), [items, filters]);
  const active = hasActiveVmFilters(filters);

  function resetFilters() {
    reset();
    searchRef.current?.focus();
  }

  if (query.isPending) {
    // Sin red, TanStack Query pausa la consulta: se informa en vez de girar indefinidamente.
    if (query.fetchStatus === 'paused') {
      return (
        <ErrorState
          title="Sin conexión"
          description="No hay red disponible. El inventario se cargará al recuperar la conexión."
          onRetry={() => query.refetch()}
        />
      );
    }
    return (
      <ViewLoading label={viewMeta.vms.loading}>
        <VmListSkeleton />
      </ViewLoading>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        title="No se pudo cargar el inventario"
        description="La API no respondió. Comprueba que el servicio está en marcha y vuelve a intentarlo."
        onRetry={() => query.refetch()}
      />
    );
  }

  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={ServerOff}
        title="Todavía no hay máquinas virtuales"
        description={
          isAdmin
            ? 'Crea la primera VM: define sus recursos y si arranca encendida.'
            : 'Cuando un administrador añada máquinas, aparecerán aquí.'
        }
        action={<NewVmButton label="Crear la primera VM" />}
      />
    );
  }

  return (
    <>
      <VmFiltersBar
        filters={filters}
        active={active}
        matched={visible.length}
        total={items.length}
        onChange={update}
        onReset={resetFilters}
        searchRef={searchRef}
      />
      {visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Ninguna VM coincide con los filtros"
          description={`Filtros activos: ${describeFilters(filters)}. Prueba con otro nombre o restablece los filtros para ver las ${items.length} VMs.`}
          action={
            <Button type="button" variant="secondary" onClick={resetFilters}>
              <RotateCcw aria-hidden className="size-4" />
              Restablecer filtros
            </Button>
          }
        />
      ) : (
        <>
          <VmTable items={visible} />
          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {visible.map((vm) => (
              <VmCard key={vm.id} vm={vm} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
