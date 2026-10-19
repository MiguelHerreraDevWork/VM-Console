'use client';

import Link from 'next/link';

import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Button } from '../../components/ui/Button';
import { RoleGate } from '../auth/RoleGate';
import { useSession } from '../auth/hooks';
import { useVmsQuery } from './hooks';
import { VmCard } from './VmCard';
import { VmListSkeleton } from './VmListSkeleton';
import { VmTable } from './VmTable';

export function VmList() {
  const { isAdmin } = useSession();
  const query = useVmsQuery();

  if (query.isLoading) {
    return <VmListSkeleton />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="No se pudo cargar el inventario"
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
        description={
          isAdmin
            ? 'Crea la primera VM para empezar a gestionar el inventario.'
            : 'Cuando el administrador añada máquinas, aparecerán aquí.'
        }
        action={
          <RoleGate action="vm:create">
            <Button asChild>
              <Link href="/vms/new">Crear la primera VM</Link>
            </Button>
          </RoleGate>
        }
      />
    );
  }

  return (
    <>
      <VmTable items={items} />
      <div className="grid gap-3 lg:hidden">
        {items.map((vm) => (
          <VmCard key={vm.id} vm={vm} />
        ))}
      </div>
    </>
  );
}
