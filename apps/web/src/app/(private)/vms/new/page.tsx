import type { Metadata } from 'next';

import { AppShell } from '../../../../components/layout/AppShell';
import { CreateVmPage } from '../../../../features/vms/CreateVmPage';

export const metadata: Metadata = {
  title: 'Nueva VM',
};

export default function NewVmRoute() {
  return (
    <AppShell title="Nueva VM">
      <CreateVmPage />
    </AppShell>
  );
}
