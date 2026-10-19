import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { SessionHydration } from '../../features/auth/SessionHydration';
import { fetchSessionUser } from '../../features/auth/session-server';
import { safeNextPath } from '../../lib/safe-next';

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const user = await fetchSessionUser();
  if (!user) {
    const pathname = (await headers()).get('x-pathname');
    const next = encodeURIComponent(safeNextPath(pathname, '/dashboard'));
    redirect(`/login?next=${next}`);
  }

  return <SessionHydration user={user!}>{children}</SessionHydration>;
}
