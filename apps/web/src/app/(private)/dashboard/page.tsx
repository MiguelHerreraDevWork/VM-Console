import type { Metadata } from 'next';

import { AppShell } from '../../../components/layout/AppShell';
import { PageHeader } from '../../../components/layout/PageHeader';
import { DashboardView } from '../../../features/dashboard/DashboardView';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return (
    <AppShell title="Panel">
      <PageHeader
        title="Resumen"
        breadcrumb={['Inicio', 'Panel']}
        description="Recursos asignados a las VMs encendidas (status ON). No se muestran métricas de utilización inventadas."
      />
      <DashboardView />
    </AppShell>
  );
}
