'use client';

import { Pencil, Power, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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

  function toggleStatus() {
    if (busy || updateVm.isPending) {
      return;
    }
    const nextStatus = vm.status === 'ON' ? 'OFF' : 'ON';
    updateVm.mutate({
      id: vm.id,
      input: { ...vmToInput(vm), status: nextStatus },
      successToast:
        nextStatus === 'ON' ? `«${vm.name}» encendida` : `«${vm.name}» apagada`,
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
      <div className="flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => toggleStatus()}
          disabled={busy || updateVm.isPending}
          aria-label={vm.status === 'ON' ? `Apagar ${vm.name}` : `Encender ${vm.name}`}
          title={vm.status === 'ON' ? 'Apagar' : 'Encender'}
        >
          <Power className="size-4" aria-hidden />
        </Button>
        {busy ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled
            aria-label={`Editar ${vm.name} (guardando…)`}
            title="Guardando…"
          >
            <Pencil className="size-4" aria-hidden />
          </Button>
        ) : (
          <Button asChild variant="ghost" size="icon" aria-label={`Editar ${vm.name}`}>
            <Link href={`/vms/${vm.id}/edit`}>
              <Pencil className="size-4" aria-hidden />
            </Link>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setConfirmOpen(true)}
          disabled={busy || deleteVm.isPending}
          aria-label={`Eliminar ${vm.name}`}
          title="Eliminar"
        >
          <Trash2 className="size-4 text-[var(--danger)]" aria-hidden />
        </Button>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Eliminar VM"
          description={`¿Eliminar «${vm.name}»? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          danger
          onConfirm={() => confirmDelete()}
        />
      </div>
    </RoleGate>
  );
}
