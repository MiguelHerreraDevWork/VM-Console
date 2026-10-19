'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

import { LinkPendingReporter } from '../../components/layout/navigation-pending';
import { Button } from '../../components/ui/Button';
import { RoleGate } from '../auth/RoleGate';

/** Acción principal de alta; para CLIENT no existe en el DOM. */
export function NewVmButton({ label = 'Nueva VM' }: { label?: string }) {
  return (
    <RoleGate action="vm:create">
      <Button asChild>
        <Link href="/vms/new">
          <Plus className="size-4" aria-hidden />
          {label}
          <LinkPendingReporter href="/vms/new" />
        </Link>
      </Button>
    </RoleGate>
  );
}
