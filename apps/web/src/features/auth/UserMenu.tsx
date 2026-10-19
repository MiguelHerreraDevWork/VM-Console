'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, LogOut } from 'lucide-react';

import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { roleLabel } from '../../lib/labels';
import { useLogout, useSession } from './hooks';

export function UserMenu() {
  const { user } = useSession();
  const logout = useLogout();

  if (!user) {
    return null;
  }

  const initial = user.email.charAt(0).toUpperCase();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="press flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-1.5 text-sm hover:bg-[var(--surface-2)] data-[state=open]:bg-[var(--surface-2)] sm:pr-2.5"
        aria-label={`Menú de usuario: ${user.email}, ${roleLabel(user.role)}`}
      >
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-full bg-[var(--surface-2)] text-sm font-semibold text-[var(--text)] ring-1 ring-[var(--border-strong)]"
        >
          {initial}
        </span>
        <span className="hidden max-w-44 truncate font-medium lg:inline">{user.email}</span>
        <Badge tone={user.role === 'ADMIN' ? 'accent' : 'muted'} className="hidden sm:inline-flex">
          {roleLabel(user.role)}
        </Badge>
        <ChevronDown className="size-4 text-[var(--muted)]" aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="menu-anim z-50 min-w-60 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-pop)]"
        >
          <div className="flex flex-col gap-1.5 px-2.5 py-2">
            <p className="truncate text-sm font-semibold">{user.email}</p>
            <Badge tone={user.role === 'ADMIN' ? 'accent' : 'muted'} className="self-start">
              {roleLabel(user.role)}
            </Badge>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-[var(--border)]" />
          <DropdownMenu.Item
            disabled={logout.isPending}
            className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 text-sm font-medium outline-none data-[disabled]:cursor-progress data-[highlighted]:bg-[var(--surface-2)]"
            onSelect={(event) => {
              event.preventDefault();
              logout.mutate();
            }}
          >
            {logout.isPending ? <Spinner /> : <LogOut className="size-4" aria-hidden />}
            {logout.isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
