'use client';

import { usePathname } from 'next/navigation';

import { viewForPath } from '../../components/layout/nav';
import { RouteLoadingView } from '../../components/layout/RouteLoadingView';

/**
 * Carga de ruta dentro del shell (menú y barra superior siguen visibles e intactos).
 * Next la muestra solo mientras la vista de destino está realmente pendiente.
 */
export default function PrivateLoading() {
  return <RouteLoadingView view={viewForPath(usePathname())} />;
}
