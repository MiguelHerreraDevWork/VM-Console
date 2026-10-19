import type { Metadata } from 'next';

import { AppShell } from '../../../../../components/layout/AppShell';
import { EditVmPage } from '../../../../../features/vms/EditVmPage';

export const metadata: Metadata = {
  title: 'Editar VM',
};

export default async function EditVmRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell title="Editar VM">
      <EditVmPage id={id} />
    </AppShell>
  );
}
