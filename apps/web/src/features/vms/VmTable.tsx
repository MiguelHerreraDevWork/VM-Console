'use client';

import { cn } from '../../lib/cn';
import { useSession } from '../auth/hooks';
import { useVmHighlighted } from '../realtime/RealtimeProvider';
import { VmActions } from './VmActions';
import { VmStatusBadge } from './VmStatusBadge';
import type { VmView } from './types';

function VmTableRow({
  vm,
  isAdmin,
}: {
  vm: VmView;
  isAdmin: boolean;
}) {
  const pending = Boolean(vm.pending);
  const highlighted = useVmHighlighted(vm.id);

  return (
    <tr
      className={cn(
        'vm-surface border-t border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface)]',
        pending && 'opacity-70',
        highlighted && 'vm-highlighted',
      )}
      aria-busy={pending || undefined}
      data-highlighted={highlighted || undefined}
    >
      <th scope="row" className="px-4 py-3 font-medium text-[var(--text)]">
        <span className="flex flex-col gap-0.5">
          {vm.name}
          {pending ? (
            <span className="text-xs font-normal text-[var(--muted)]">Guardando…</span>
          ) : null}
        </span>
      </th>
      <td className="px-4 py-3 text-[var(--muted)]">{vm.os}</td>
      <td className="px-4 py-3 font-mono">{vm.cores}</td>
      <td className="px-4 py-3 font-mono">{vm.ram} GB</td>
      <td className="px-4 py-3 font-mono">{vm.disk} GB</td>
      <td className="px-4 py-3">
        <VmStatusBadge status={vm.status} />
      </td>
      {isAdmin ? (
        <td className="px-4 py-3">
          <VmActions vm={vm} />
        </td>
      ) : null}
    </tr>
  );
}

export function VmTable({ items }: { items: VmView[] }) {
  const { isAdmin } = useSession();

  return (
    <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] lg:block">
      <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
        <thead className="bg-[var(--surface)] text-[var(--muted)]">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Nombre
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              SO
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              vCPU
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              RAM
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Disco
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Estado
            </th>
            {isAdmin ? (
              <th scope="col" className="px-4 py-3 font-medium">
                Acciones
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {items.map((vm) => (
            <VmTableRow key={vm.id} vm={vm} isAdmin={Boolean(isAdmin)} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
