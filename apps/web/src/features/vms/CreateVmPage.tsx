'use client';

import { vmNameKey, type VmInput } from '@repo/contracts';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { PageHeader } from '../../components/layout/PageHeader';
import { useCreateVm, useVmsQuery } from './hooks';
import { defaultVmValues, VmForm, type VmFormSubmitHelpers } from './VmForm';
import { useVmDraft } from './VmDraftProvider';

export function CreateVmPage() {
  const router = useRouter();
  const createVm = useCreateVm();
  const vmsQuery = useVmsQuery();
  const { draft, clearDraft } = useVmDraft();
  const createDraft = draft?.kind === 'create' ? draft : null;

  const takenNameKeys = useMemo(() => {
    const items = vmsQuery.data ?? [];
    return new Set(items.map((vm) => vmNameKey(vm.name)));
  }, [vmsQuery.data]);

  function onSubmit(values: VmInput, { setError }: VmFormSubmitHelpers) {
    const key = vmNameKey(values.name);
    if (takenNameKeys.has(key)) {
      setError('name', {
        type: 'duplicate',
        message: 'Ya existe una VM con ese nombre (sin distinguir mayúsculas).',
      });
      return;
    }

    clearDraft();
    createVm.mutate(values);
    router.push('/vms');
  }

  return (
    <>
      <PageHeader
        title="Nueva máquina virtual"
        breadcrumb={['Inicio', 'Máquinas', 'Nueva']}
        description="Completa los datos. La validación se aplica mientras escribes."
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
          router.push('/vms');
        }}
        onSubmit={onSubmit}
      />
    </>
  );
}
