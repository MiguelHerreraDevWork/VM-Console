import { LayoutDashboard, Server, type LucideIcon } from 'lucide-react';

export const primaryNav: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/vms', label: 'Máquinas', icon: Server },
];

/**
 * Cabecera y etiqueta de carga de cada vista privada. La comparten las páginas, la carga
 * de ruta (`loading.tsx`) y la carga de datos de cliente, para que coincidan exactamente.
 */
export const viewMeta = {
  dashboard: {
    title: 'Panel',
    description: 'Recursos asignados a las máquinas encendidas y estado del inventario.',
    loading: 'Cargando panel…',
  },
  vms: {
    title: 'Máquinas virtuales',
    description: 'Inventario completo con sus recursos y estado.',
    loading: 'Cargando inventario…',
  },
  newVm: {
    title: 'Nueva máquina virtual',
    description:
      'Los campos se validan mientras escribes. La VM aparece en el inventario al guardar.',
    loading: 'Abriendo formulario…',
  },
  editVm: {
    title: 'Editar máquina virtual',
    description:
      'Los cambios se reflejan al instante en el inventario y se revierten si la API los rechaza.',
    loading: 'Cargando datos de la VM…',
  },
} as const;

export type ViewKey = keyof typeof viewMeta;

export function viewForPath(pathname: string): ViewKey {
  if (pathname.startsWith('/vms/new')) {
    return 'newVm';
  }
  if (/^\/vms\/[^/]+\/edit/.test(pathname)) {
    return 'editVm';
  }
  if (pathname.startsWith('/vms')) {
    return 'vms';
  }
  return 'dashboard';
}

export type Crumb = { label: string; href?: string };

/** Miga de pan derivada de la ruta; la barra superior la muestra en todas las vistas privadas. */
export function routeCrumbs(pathname: string): Crumb[] {
  if (pathname.startsWith('/vms/new')) {
    return [{ label: 'Máquinas', href: '/vms' }, { label: 'Nueva VM' }];
  }
  if (/^\/vms\/[^/]+\/edit/.test(pathname)) {
    return [{ label: 'Máquinas', href: '/vms' }, { label: 'Editar VM' }];
  }
  if (pathname.startsWith('/vms')) {
    return [{ label: 'Máquinas' }];
  }
  return [{ label: 'Panel' }];
}

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
