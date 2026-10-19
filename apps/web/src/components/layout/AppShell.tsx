'use client';

import type { ReactNode } from 'react';

import { RealtimeAnnouncer } from '../../features/realtime/RealtimeAnnouncer';
import { RealtimeProvider } from '../../features/realtime/RealtimeProvider';
import { MobileNav } from './MobileNav';
import { viewForPath } from './nav';
import { NavigationPendingProvider, useNavigationPending } from './navigation-pending';
import { RouteLoadingView } from './RouteLoadingView';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

/**
 * Área principal. Desde el clic en un enlace hasta que Next confirma la ruta, muestra la
 * carga de la vista de destino; después, `loading.tsx` o la propia vista toman el relevo con
 * la misma cabecera, etiqueta y esqueleto. El contenido anterior queda oculto, no desmontado,
 * por si la navegación se cancela.
 */
function MainContent({ children }: { children: ReactNode }) {
  const pendingHref = useNavigationPending();
  const navigating = pendingHref !== null;

  return (
    <main
      id="contenido"
      tabIndex={-1}
      aria-busy={navigating || undefined}
      className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-6 focus:outline-none md:px-8 md:pb-10 md:pt-8"
    >
      {navigating ? <RouteLoadingView view={viewForPath(pendingHref)} /> : null}
      <div hidden={navigating}>{children}</div>
    </main>
  );
}

/**
 * Shell privado. Vive en el layout de `(private)`, así que persiste entre rutas:
 * el socket de tiempo real y la navegación no se remontan al cambiar de página.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <RealtimeProvider>
      <NavigationPendingProvider>
        <div className="flex min-h-dvh bg-[var(--bg)] text-[var(--text)]">
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-md)] focus:bg-[var(--accent)] focus:px-3 focus:py-2 focus:text-[var(--on-accent)]"
          >
            Saltar al contenido
          </a>
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <RealtimeAnnouncer />
            <MainContent>{children}</MainContent>
            <MobileNav />
          </div>
        </div>
      </NavigationPendingProvider>
    </RealtimeProvider>
  );
}
