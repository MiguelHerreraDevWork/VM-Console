'use client';

import type { ReactNode } from 'react';

import { RealtimeAnnouncer } from '../../features/realtime/RealtimeAnnouncer';
import { RealtimeProvider } from '../../features/realtime/RealtimeProvider';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <RealtimeProvider>
      <div className="flex min-h-dvh bg-[var(--bg)] text-[var(--text)]">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-md)] focus:bg-[var(--accent)] focus:px-3 focus:py-2 focus:text-[var(--on-accent)]"
        >
          Saltar al contenido
        </a>
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar title={title} />
          <RealtimeAnnouncer />
          <main id="contenido" className="flex-1 px-4 py-6 md:px-8">
            {children}
          </main>
          <MobileNav />
        </div>
      </div>
    </RealtimeProvider>
  );
}
