'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, LogOut } from 'lucide-react';

import { roleLabel } from '../../lib/labels';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLogout, useSession } from './hooks';

export function UserMenu() {
  const { user } = useSession();
  const logout = useLogout();

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button type="button" variant="secondary" size="sm" aria-label="Menú de usuario">
          <span className="hidden max-w-40 truncate sm:inline">{user.email}</span>
          <Badge tone="accent">{roleLabel(user.role)}</Badge>
          <ChevronDown className="size-4" aria-hidden />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-56 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow)]"
        >
          <div className="px-2 py-2">
            <p className="truncate text-sm font-medium">{user.email}</p>
            <p className="text-xs text-[var(--muted)]">{roleLabel(user.role)}</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-[var(--border)]" />
          <DropdownMenu.Item
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 text-sm outline-none data-[highlighted]:bg-[var(--surface-2)]"
            onSelect={(event) => {
              event.preventDefault();
              logout.mutate();
            }}
          >
            <LogOut className="size-4" aria-hidden />
            Cerrar sesión
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
