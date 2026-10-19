'use client';

import { vmNameKey, type VmInput } from '@repo/contracts';
import { useMemo } from 'react';

import { viewMeta } from '../../components/layout/nav';
import { useNavigateWithPending } from '../../components/layout/navigation-pending';
import { PageHeader } from '../../components/layout/PageHeader';
import { useCreateVm, useVmsQuery } from './hooks';
import { defaultVmValues, VmForm, type VmFormSubmitHelpers } from './VmForm';
import { useVmDraft } from './VmDraftProvider';

export function CreateVmPage() {
  // Tras guardar o cancelar, el área principal muestra la carga del listado hasta que llega.
  const navigate = useNavigateWithPending();
  const createVm = useCreateVm();
  const vmsQuery = useVmsQuery();
  const { draft, clearDraft } = useVmDraft();
  const createDraft = draft?.kind === 'create' ? draft : null;

  const takenNameKeys = useMemo(() => {
    const items = vmsQuery.data ?? [];
    return new Set(items.map((vm) => vmNameKey(vm.name)));
  }, [vmsQuery.data]);

  function onSubmit(values: VmInput, { setError }: VmFormSubmitHelpers) {
    if (takenNameKeys.has(vmNameKey(values.name))) {
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
    createVm.mutate(values);
    navigate('/vms');
  }

  return (
    <>
      <PageHeader
        title={viewMeta.newVm.title}
        description={
          createDraft
            ? 'Recuperamos los datos del intento anterior para que puedas corregirlos y reintentar.'
            : viewMeta.newVm.description
        }
      />
      <VmForm
        key={createDraft ? 'draft' : 'blank'}
        defaultValues={createDraft?.values ?? defaultVmValues}
        submitLabel="Crear VM"
        pending={createVm.isPending}
        takenNameKeys={takenNameKeys}
        initialNameTaken={createDraft?.nameTaken === true}
        onCancel={() => {
          clearDraft();
          navigate('/vms');
        }}
        onSubmit={onSubmit}
      />
    </>
  );
}
