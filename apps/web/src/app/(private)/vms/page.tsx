import type { Metadata } from 'next';

import { AppShell } from '../../../components/layout/AppShell';
import { PageHeader } from '../../../components/layout/PageHeader';
import { VmList } from '../../../features/vms/VmList';

export const metadata: Metadata = {
  title: 'Máquinas virtuales',
};

export default function VmsPage() {
  return (
    <AppShell title="Máquinas virtuales">
      <PageHeader
        title="Inventario"
        breadcrumb={['Inicio', 'Máquinas']}
        description="Listado de máquinas virtuales. Las acciones de escritura solo existen para Administrador."
      />
      <VmList />
    </AppShell>
  );
}
