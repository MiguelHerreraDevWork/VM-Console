import type { ReactNode } from 'react';

/**
 * Se remonta en cada navegación dentro del shell: la vista entra con un fundido corto
 * (160ms, ease-out). Solo opacidad y desplazamiento de 6px; no retrasa la interacción.
 */
export default function PrivateTemplate({ children }: { children: ReactNode }) {
  return <div className="route-enter">{children}</div>;
}
