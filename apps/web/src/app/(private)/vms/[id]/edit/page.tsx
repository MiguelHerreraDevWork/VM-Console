import type { Metadata } from 'next';

import { EditVmPage } from '../../../../../features/vms/EditVmPage';

export const metadata: Metadata = {
  title: 'Editar VM',
};

export default async function EditVmRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditVmPage id={id} />;
}
