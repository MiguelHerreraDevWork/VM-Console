import type { Metadata } from 'next';

import { viewMeta } from '../../../components/layout/nav';
import { PageHeader } from '../../../components/layout/PageHeader';
import { DashboardView } from '../../../features/dashboard/DashboardView';
import { NewVmButton } from '../../../features/vms/NewVmButton';

export const metadata: Metadata = {
  title: 'Panel',
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title={viewMeta.dashboard.title}
        description={viewMeta.dashboard.description}
        actions={<NewVmButton />}
      />
      <DashboardView />
    </>
  );
}
