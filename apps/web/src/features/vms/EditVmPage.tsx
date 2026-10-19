'use client';

import { vmNameKey, type VmInput } from '@repo/contracts';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PageHeader } from '../../components/layout/PageHeader';
import { PageSkeleton } from '../../components/layout/PageSkeleton';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { fetchVms } from './api';
import { useUpdateVm, useVmsQuery, vmToInput, vmsQueryKey } from './hooks';
import { isTempVmId } from './types';
import { VmForm, type VmFormSubmitHelpers } from './VmForm';
import { useVmDraft } from './VmDraftProvider';

export function EditVmPage({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateVm = useUpdateVm();
  const vmsQuery = useVmsQuery();
  const { draft, clearDraft } = useVmDraft();
  const updateDraft =
    draft?.kind === 'update' && draft.vmId === id ? draft : null;
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error' | 'temp'>(
    'loading',
  );
  const [defaults, setDefaults] = useState<VmInput | null>(null);
  const [excludeNameKey, setExcludeNameKey] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (isTempVmId(id)) {
      setStatus('temp');
      return;
    }
    setStatus('loading');
    try {
      const items = await queryClient.ensureQueryData({
        queryKey: vmsQueryKey,
        queryFn: fetchVms,
      });
      const vm = items.find((item) => item.id === id);
      if (!vm) {
        setDefaults(null);
        setStatus('missing');
        return;
      }
      setDefaults(updateDraft?.values ?? vmToInput(vm));
      setExcludeNameKey(vmNameKey(vm.name));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [id, queryClient, updateDraft]);

  useEffect(() => {
    void load();
  }, [load]);

  const takenNameKeys = useMemo(() => {
    const items = vmsQuery.data ?? [];
    return new Set(items.map((vm) => vmNameKey(vm.name)));
  }, [vmsQuery.data]);

  function onSubmit(values: VmInput, _helpers: VmFormSubmitHelpers) {
    clearDraft();
    updateVm.mutate({ id, input: values });
    router.push('/vms');
  }

  if (status === 'temp') {
    return (
      <>
        <PageHeader title="Editar máquina virtual" breadcrumb={['Inicio', 'Máquinas']} />
        <EmptyState
          title="VM aún no guardada"
          description="Esta máquina todavía se está creando. Espera a que termine o vuelve al listado."
          action={
            <Button asChild variant="secondary">
              <Link href="/vms">Volver al listado</Link>
            </Button>
          }
        />
      </>
    );
  }

  if (status === 'loading') {
    return (
      <>
        <PageHeader
          title="Editar máquina virtual"
          breadcrumb={['Inicio', 'Máquinas', id]}
          description="Cargando datos…"
        />
        <PageSkeleton rows={6} />
      </>
    );
  }

  if (status === 'error') {
    return (
      <>
        <PageHeader title="Editar máquina virtual" breadcrumb={['Inicio', 'Máquinas', id]} />
        <ErrorState
          title="No se pudo cargar la VM"
          description="La consulta al inventario falló."
          onRetry={() => void load()}
        />
      </>
    );
  }

  if (status === 'missing' || !defaults) {
    return (
      <>
        <PageHeader title="Editar máquina virtual" breadcrumb={['Inicio', 'Máquinas', id]} />
        <EmptyState
          title="VM no encontrada"
          description={`No hay una máquina con id «${id}».`}
          action={
            <Button asChild variant="secondary">
              <Link href="/vms">Volver al listado</Link>
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Editar máquina virtual"
        breadcrumb={['Inicio', 'Máquinas', defaults.name]}
        description="Los cambios se reflejan al instante en el inventario."
      />
      <VmForm
        key={`${id}-${updateDraft ? 'draft' : 'saved'}`}
        defaultValues={defaults}
        submitLabel="Guardar cambios"
        pending={updateVm.isPending}
        excludeNameKey={excludeNameKey}
        takenNameKeys={takenNameKeys}
        initialNameTaken={updateDraft?.nameTaken === true}
        onCancel={() => {
          clearDraft();
          router.push('/vms');
        }}
        onSubmit={onSubmit}
      />
    </>
  );
}
