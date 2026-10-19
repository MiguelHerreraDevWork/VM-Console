'use client';

import { DashboardSkeleton } from '../../features/dashboard/DashboardView';
import { NewVmButton } from '../../features/vms/NewVmButton';
import { VmFormSkeleton } from '../../features/vms/VmFormSkeleton';
import { VmListSkeleton } from '../../features/vms/VmListSkeleton';
import { viewMeta, type ViewKey } from './nav';
import { PageHeader } from './PageHeader';
import { ViewLoading } from './ViewLoading';

/**
 * Vista de carga de una ruta privada: su cabecera real + indicador con texto + esqueleto.
 * La usan la navegación pendiente (desde el clic) y `loading.tsx` (desde que Next confirma
 * la ruta); al ser idénticas, el relevo entre ambas no se percibe ni duplica indicadores.
 */
export function RouteLoadingView({ view }: { view: ViewKey }) {
  const meta = viewMeta[view];
  const withCreate = view === 'dashboard' || view === 'vms';

  return (
    <>
      <PageHeader
        title={meta.title}
        description={meta.description}
        actions={withCreate ? <NewVmButton /> : undefined}
      />
      <ViewLoading label={meta.loading}>
        {view === 'dashboard' ? <DashboardSkeleton /> : null}
        {view === 'vms' ? <VmListSkeleton /> : null}
        {view === 'newVm' || view === 'editVm' ? <VmFormSkeleton /> : null}
      </ViewLoading>
    </>
  );
}
