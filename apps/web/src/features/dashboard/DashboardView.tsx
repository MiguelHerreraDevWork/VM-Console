'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo } from 'react';

import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { RoleGate } from '../auth/RoleGate';
import { useVmsQuery } from '../vms/hooks';
import { VmCard } from '../vms/VmCard';
import { aggregateResources } from './lib/aggregate-resources';
import { ResourceKpis } from './ResourceKpis';

const AllocatedResourcesChart = dynamic(
  () =>
    import('./AllocatedResourcesChart').then((mod) => mod.AllocatedResourcesChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-80 w-full rounded-[var(--radius-lg)]" />,
  },
);

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Cargando dashboard">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-[var(--radius-lg)]" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-[var(--radius-lg)]" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-[var(--radius-lg)]" />
        ))}
      </div>
    </div>
  );
}

export function DashboardView() {
  const query = useVmsQuery();

  const aggregate = useMemo(
    () => aggregateResources(query.data ?? []),
    [query.data],
  );

  if (query.isLoading) {
    return <DashboardSkeleton />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="No se pudo cargar el dashboard"
        description="Comprueba la conexión con la API e inténtalo de nuevo."
        onRetry={() => void query.refetch()}
      />
    );
  }

  const items = query.data ?? [];

  if (items.length === 0) {
    return (
      <EmptyState
        title="No hay máquinas virtuales"
        description="Cuando existan VMs, verás aquí los recursos asignados a las encendidas."
        action={
          <RoleGate action="vm:create">
            <Button asChild>
              <Link href="/vms/new">Crear primera VM</Link>
            </Button>
          </RoleGate>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <ResourceKpis aggregate={aggregate} />

      {aggregate.on === 0 ? (
        <EmptyState
          title="No hay VMs encendidas"
          description="No hay recursos asignados mientras todas las máquinas estén apagadas."
        />
      ) : (
        <AllocatedResourcesChart byOs={aggregate.byOs} />
      )}

      <section aria-labelledby="dashboard-vms-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 id="dashboard-vms-title" className="text-lg font-semibold tracking-tight">
              Máquinas virtuales
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Vista rápida del inventario. Las acciones de escritura solo existen para Administrador.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RoleGate action="vm:create">
              <Button asChild size="sm">
                <Link href="/vms/new">Nueva VM</Link>
              </Button>
            </RoleGate>
            <Button asChild variant="secondary" size="sm">
              <Link href="/vms">Ver todas</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((vm) => (
            <VmCard key={vm.id} vm={vm} />
          ))}
        </div>
      </section>
    </div>
  );
}
