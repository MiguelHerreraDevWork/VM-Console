import type { Metadata } from 'next';

import { CreateVmPage } from '../../../../features/vms/CreateVmPage';

export const metadata: Metadata = {
  title: 'Nueva VM',
};

export default function NewVmRoute() {
  return <CreateVmPage />;
}
