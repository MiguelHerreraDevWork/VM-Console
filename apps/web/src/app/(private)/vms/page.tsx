import type { Metadata } from 'next';

import { viewMeta } from '../../../components/layout/nav';
import { PageHeader } from '../../../components/layout/PageHeader';
import { NewVmButton } from '../../../features/vms/NewVmButton';
import { VmList } from '../../../features/vms/VmList';

export const metadata: Metadata = {
  title: 'Máquinas virtuales',
};

export default function VmsPage() {
  return (
    <>
      <PageHeader
        title={viewMeta.vms.title}
        description={viewMeta.vms.description}
        actions={<NewVmButton />}
      />
      <VmList />
    </>
  );
}
