import type { ReactNode } from 'react';

import { Spinner } from '../ui/Spinner';

/**
 * Carga de una vista dentro del área principal: indicador circular con texto + esqueleto
 * con la geometría final. Lo usan tanto la carga de ruta (`loading.tsx`) como la carga de
 * datos de cliente con la misma etiqueta y forma, de modo que el paso de una a otra no
 * duplica indicadores ni produce saltos.
 */
export function ViewLoading({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <p
        role="status"
        className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]"
        data-view-loading
      >
        <Spinner className="text-[var(--accent-hover)]" />
        {label}
      </p>
      <div aria-hidden>{children}</div>
    </div>
  );
}
