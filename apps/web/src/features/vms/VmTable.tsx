'use client';

import { cn } from '../../lib/cn';
import { formatCount } from '../dashboard/lib/format';
import { useSession } from '../auth/hooks';
import { useVmHighlighted } from '../realtime/RealtimeProvider';
import { VmActions } from './VmActions';
import { pendingSurface, VmPendingNote } from './VmPendingNote';
import { VmStatusBadge } from './VmStatusBadge';
import type { VmView } from './types';

function Amount({ value, unit }: { value: number; unit?: string }) {
  return (
    <>
      <span className="font-semibold tabular-nums text-[var(--text)]">{formatCount(value)}</span>
      {unit ? <span className="ml-1 text-[var(--muted)]">{unit}</span> : null}
    </>
  );
}

function VmTableRow({ vm, isAdmin }: { vm: VmView; isAdmin: boolean }) {
  const highlighted = useVmHighlighted(vm.id);
  const deleting = vm.pending === 'delete';

  return (
    <tr
      className={cn(
        'vm-surface border-t border-[var(--border)]',
        vm.pending ? pendingSurface(vm.pending) : 'hover:bg-[var(--surface-hover)]',
        deleting && '[&>td]:opacity-60',
        highlighted && 'vm-highlighted',
      )}
      aria-busy={vm.pending ? true : undefined}
      data-pending={vm.pending}
      data-highlighted={highlighted || undefined}
    >
      <th scope="row" className="px-4 py-3 text-left font-semibold text-[var(--text)]">
        <span className="flex flex-col gap-0.5">
          <span className={cn(deleting && 'line-through decoration-[var(--danger)] opacity-60')}>
            {vm.name}
          </span>
          {vm.pending ? <VmPendingNote pending={vm.pending} name={vm.name} /> : null}
        </span>
      </th>
      <td className="px-4 py-3 text-[var(--muted)]">{vm.os}</td>
      <td className="px-4 py-3 text-right">
        <Amount value={vm.cores} />
      </td>
      <td className="px-4 py-3 text-right">
        <Amount value={vm.ram} unit="GB" />
      </td>
      <td className="px-4 py-3 text-right">
        <Amount value={vm.disk} unit="GB" />
      </td>
      <td className="px-4 py-3">
        <VmStatusBadge status={vm.status} />
      </td>
      {isAdmin ? (
        <td className="px-2 py-1.5">
          <div className="flex justify-end">
            <VmActions vm={vm} />
          </div>
        </td>
      ) : null}
    </tr>
  );
}

export function VmTable({ items }: { items: VmView[] }) {
  const { isAdmin } = useSession();

  return (
    <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] lg:block">
      <table className="w-full min-w-[52rem] border-collapse text-sm">
        <caption className="sr-only">Inventario de máquinas virtuales</caption>
        <thead className="text-xs font-semibold text-[var(--muted)]">
          <tr>
            <th scope="col" className="px-4 py-3 text-left">
              Nombre
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              Sistema
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              vCPU
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              RAM
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              Disco
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              Estado
            </th>
            {isAdmin ? (
              <th scope="col" className="px-4 py-3 text-right">
                <span className="sr-only">Acciones</span>
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
