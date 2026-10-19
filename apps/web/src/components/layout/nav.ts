import { LayoutDashboard, Server, type LucideIcon } from 'lucide-react';

export const primaryNav: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/vms', label: 'Máquinas', icon: Server },
];
