import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { fetchSessionUser } from '../../../features/auth/session-server';

export default async function AdminOnlyLayout({ children }: { children: ReactNode }) {
  const user = await fetchSessionUser();
  if (!user) {
    redirect('/login?next=/vms');
  }
  if (user.role !== 'ADMIN') {
    redirect('/vms');
  }
  return children;
}
