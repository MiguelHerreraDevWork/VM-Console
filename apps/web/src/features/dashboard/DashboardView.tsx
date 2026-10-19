'use client';

import { ServerOff } from 'lucide-react';
import { useMemo } from 'react';

import { viewMeta } from '../../components/layout/nav';
import { ViewLoading } from '../../components/layout/ViewLoading';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useVmsQuery } from '../vms/hooks';
import { NewVmButton } from '../vms/NewVmButton';
import { aggregateResources } from './lib/aggregate-resources';
import { ResourcePanel } from './ResourcePanel';

/** Geometría del Panel mientras llegan los datos (la etiqueta la pone `ViewLoading`). */
export function DashboardSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:justify-between sm:p-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-3 border-t border-[var(--border)]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 border-l border-[var(--border)] px-4 py-4 first:border-l-0 sm:px-6"
          >
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
      <div className="grid border-t border-[var(--border)] lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-3 p-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-60 w-full" />
        </div>
        <div className="flex flex-col gap-4 border-t border-[var(--border)] p-5 lg:border-l lg:border-t-0">
          <Skeleton className="h-4 w-56" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Panel de resumen. El inventario completo y las acciones por VM viven en Máquinas
 * (`/vms`); aquí solo se resume, con enlace a esa ruta, sin un segundo listado.
 */
export function DashboardView() {
  const query = useVmsQuery();
  const items = query.data;

  // Derivado de la misma caché: los cambios optimistas y en tiempo real recalculan
  // sumas, gráfico y ranking sin código adicional.
  const aggregate = useMemo(() => aggregateResources(items ?? []), [items]);

  if (query.isPending) {
    if (query.fetchStatus === 'paused') {
      return (
        <ErrorState
          title="Sin conexión"
          description="No hay red disponible. El panel se cargará al recuperar la conexión."
          onRetry={() => query.refetch()}
        />
      );
    }
    return (
      <ViewLoading label={viewMeta.dashboard.loading}>
        <DashboardSkeleton />
      </ViewLoading>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        title="No se pudo cargar el panel"
        description="La API no respondió. Comprueba que el servicio está en marcha y vuelve a intentarlo."
        onRetry={() => query.refetch()}
      />
    );
  }

  if (!items || aggregate.total === 0) {
    return (
      <EmptyState
        icon={ServerOff}
        title="Todavía no hay máquinas virtuales"
        description="Cuando existan VMs verás aquí los recursos asignados a las encendidas."
        action={<NewVmButton label="Crear la primera VM" />}
      />
    );
  }

  return <ResourcePanel aggregate={aggregate} vms={items} />;
}
