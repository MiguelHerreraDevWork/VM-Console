'use client';

import { Pencil, Power, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { LinkPendingReporter } from '../../components/layout/navigation-pending';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RoleGate } from '../auth/RoleGate';
import { useDeleteVm, useUpdateVm, vmToInput } from './hooks';
import { isVmBusy, type VmView } from './types';

export function VmActions({ vm }: { vm: VmView }) {
  const updateVm = useUpdateVm();
  const deleteVm = useDeleteVm();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const busy = isVmBusy(vm);
  const isOn = vm.status === 'ON';

  function toggleStatus() {
    if (busy || updateVm.isPending) {
      return;
    }
    updateVm.mutate({
      id: vm.id,
      input: { ...vmToInput(vm), status: isOn ? 'OFF' : 'ON' },
      intent: 'power',
    });
  }

  function confirmDelete() {
    if (busy || deleteVm.isPending) {
      return;
    }
    setConfirmOpen(false);
    deleteVm.mutate(vm.id);
  }

  return (
    <RoleGate action="vm:edit">
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => toggleStatus()}
          disabled={busy || updateVm.isPending}
          aria-label={isOn ? `Apagar ${vm.name}` : `Encender ${vm.name}`}
          title={isOn ? 'Apagar' : 'Encender'}
        >
          <Power className="size-4" aria-hidden />
        </Button>
        {busy ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled
            aria-label={`Editar ${vm.name} (operación en curso)`}
            title="Operación en curso"
          >
            <Pencil className="size-4" aria-hidden />
          </Button>
        ) : (
          <Button asChild variant="ghost" size="icon-sm" aria-label={`Editar ${vm.name}`}>
            <Link href={`/vms/${vm.id}/edit`} title="Editar">
              <Pencil className="size-4" aria-hidden />
              <LinkPendingReporter href={`/vms/${vm.id}/edit`} />
            </Link>
          </Button>
        )}
        <ConfirmDialog
          // El botón es el Trigger de Radix: al cancelar o pulsar Escape el foco vuelve a él.
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={busy || deleteVm.isPending}
              aria-label={`Eliminar ${vm.name}`}
              title="Eliminar"
              className="hover:bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] hover:text-[var(--danger)]"
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          }
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="¿Eliminar esta VM?"
          description={
            <>
              Se eliminará <strong className="font-semibold text-[var(--text)]">{vm.name}</strong>{' '}
              del inventario. Esta acción no se puede deshacer.
            </>
          }
          confirmLabel="Eliminar VM"
          cancelLabel="Cancelar"
          danger
          onConfirm={() => confirmDelete()}
        />
      </div>
    </RoleGate>
  );
}
