'use client';

import { vmNameKey, type Vm, type VmInput } from '@repo/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Hourglass, SearchX } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { viewMeta } from '../../components/layout/nav';
import {
  LinkPendingReporter,
  useNavigateWithPending,
} from '../../components/layout/navigation-pending';
import { PageHeader } from '../../components/layout/PageHeader';
import { ViewLoading } from '../../components/layout/ViewLoading';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { fetchVms } from './api';
import { useUpdateVm, useVmsQuery, vmToInput, vmsQueryKey } from './hooks';
import { isTempVmId } from './types';
import { VmForm, type VmFormSubmitHelpers } from './VmForm';
import { VmFormSkeleton } from './VmFormSkeleton';
import { useVmDraft } from './VmDraftProvider';

function BackToList() {
  return (
    <Button asChild variant="secondary">
      <Link href="/vms">
        <ArrowLeft aria-hidden className="size-4" />
        Volver al inventario
        <LinkPendingReporter href="/vms" />
      </Link>
    </Button>
  );
}

export function EditVmPage({ id }: { id: string }) {
  // Tras guardar o cancelar, el área principal muestra la carga del listado hasta que llega.
  const navigate = useNavigateWithPending();
  const queryClient = useQueryClient();
  const updateVm = useUpdateVm();
  const vmsQuery = useVmsQuery();
  const { draft, clearDraft } = useVmDraft();
  const updateDraft = draft?.kind === 'update' && draft.vmId === id ? draft : null;
  // Con la VM ya en caché el formulario se resuelve en el primer render (sin indicador de
  // carga); solo una apertura directa o recarga espera a GET /vms.
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error' | 'temp'>(() => {
    if (isTempVmId(id)) {
      return 'temp';
    }
    const cached = queryClient.getQueryData<Vm[]>(vmsQueryKey);
    if (!cached) {
      return 'loading';
    }
    return cached.some((item) => item.id === id) ? 'ready' : 'missing';
  });
  const [defaults, setDefaults] = useState<VmInput | null>(() => {
    const vm = queryClient.getQueryData<Vm[]>(vmsQueryKey)?.find((item) => item.id === id);
    return vm ? (updateDraft?.values ?? vmToInput(vm)) : null;
  });
  const [excludeNameKey, setExcludeNameKey] = useState<string | undefined>(() => {
    const vm = queryClient.getQueryData<Vm[]>(vmsQueryKey)?.find((item) => item.id === id);
    return vm ? vmNameKey(vm.name) : undefined;
  });

  const load = useCallback(async () => {
    if (isTempVmId(id)) {
      setStatus('temp');
      return;
    }
    if (!queryClient.getQueryData(vmsQueryKey)) {
      setStatus('loading');
    }
    try {
      // Usa la caché si existe; con la caché vacía (apertura directa o recarga) consulta GET /vms.
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

  function onSubmit(values: VmInput, { setError }: VmFormSubmitHelpers) {
    const key = vmNameKey(values.name);
    if (key !== excludeNameKey && takenNameKeys.has(key)) {
      setError(
        'name',
        {
          type: 'duplicate',
          message: 'Ya existe una VM con ese nombre (sin distinguir mayúsculas).',
        },
        { shouldFocus: true },
      );
      return;
    }
    clearDraft();
    updateVm.mutate({ id, input: values });
    navigate('/vms');
  }

  if (status === 'temp') {
    return (
      <>
        <PageHeader title="Editar máquina virtual" />
        <EmptyState
          icon={Hourglass}
          title="Esta VM aún se está creando"
          description="Podrás editarla en cuanto la API confirme el alta."
          action={<BackToList />}
        />
      </>
    );
  }

  if (status === 'loading') {
    // Misma cabecera, etiqueta y esqueleto que la carga de ruta de esta vista.
    return (
      <>
        <PageHeader title={viewMeta.editVm.title} description={viewMeta.editVm.description} />
        <ViewLoading label={viewMeta.editVm.loading}>
          <VmFormSkeleton />
        </ViewLoading>
      </>
    );
  }

  if (status === 'error') {
    return (
      <>
        <PageHeader title="Editar máquina virtual" />
        <ErrorState
          title="No se pudo cargar la VM"
          description="La consulta al inventario falló. Comprueba la conexión con la API."
          onRetry={() => load()}
        />
      </>
    );
  }

  if (status === 'missing' || !defaults) {
    return (
      <>
        <PageHeader title="Editar máquina virtual" />
        <EmptyState
          icon={SearchX}
          title="VM no encontrada"
          description="Puede que se haya eliminado o que el enlace no sea correcto."
          action={<BackToList />}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Editar ${defaults.name}`}
        description={
          updateDraft
            ? 'Recuperamos los cambios del intento anterior para que puedas corregirlos y reintentar.'
            : viewMeta.editVm.description
        }
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
          navigate('/vms');
        }}
        onSubmit={onSubmit}
      />
    </>
  );
}
