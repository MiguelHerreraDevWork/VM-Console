'use client';

import type { Vm, VmInput } from '@repo/contracts';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { ApiClientError } from '../../lib/api-client';
import * as api from './api';
import { navigatePreservingDraft } from './draft-nav';
import {
  findIndexById,
  insertTemp,
  removeById,
  replaceById,
  restoreAt,
} from './lib/cache';
import type { VmView } from './types';
import { useVmDraft } from './VmDraftProvider';

export const vmsQueryKey = ['vms'] as const;
export const vmsMutationKey = ['vms'] as const;

function getVmsCache(queryClient: QueryClient): VmView[] {
  return queryClient.getQueryData<VmView[]>(vmsQueryKey) ?? [];
}

function setVmsCache(queryClient: QueryClient, updater: (old: VmView[]) => VmView[]) {
  queryClient.setQueryData<VmView[]>(vmsQueryKey, (old) => updater(old ?? []));
}

function maybeInvalidateVms(queryClient: QueryClient) {
  if (queryClient.isMutating({ mutationKey: vmsMutationKey }) === 1) {
    void queryClient.invalidateQueries({ queryKey: vmsQueryKey });
  }
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiClientError) {
    return err.message;
  }
  if (err instanceof TypeError) {
    return 'No hay conexión con la API';
  }
  return fallback;
}

function toastReturnToForm(message: string, href: string) {
  toast.error(message, {
    duration: Infinity,
    action: {
      label: 'Volver al formulario',
      onClick: () => {
        navigatePreservingDraft(href);
      },
    },
  });
}

export function useVmsQuery() {
  return useQuery({
    queryKey: vmsQueryKey,
    queryFn: api.fetchVms,
  });
}

export function useCreateVm() {
  const queryClient = useQueryClient();
  const { saveDraft } = useVmDraft();

  return useMutation({
    mutationKey: [...vmsMutationKey, 'create'],
    mutationFn: (input: VmInput) => api.createVm(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: vmsQueryKey });
      const tempId = `temp-${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      const temp: VmView = {
        id: tempId,
        ...input,
        createdAt: now,
        updatedAt: now,
        pending: 'create',
      };
      setVmsCache(queryClient, (old) => insertTemp(old, temp));
      return { tempId };
    },
    onError: (err, input, ctx) => {
      if (ctx?.tempId) {
        setVmsCache(queryClient, (old) => removeById(old, ctx.tempId));
      }
      const nameTaken = err instanceof ApiClientError && err.code === 'VM_NAME_TAKEN';
      saveDraft({
        kind: 'create',
        values: input,
        ...(nameTaken ? { nameTaken: true } : {}),
      });
      toastReturnToForm(errorMessage(err, 'No se pudo crear la VM'), '/vms/new');
    },
    onSuccess: (vm, _input, ctx) => {
      if (ctx?.tempId) {
        setVmsCache(queryClient, (old) => replaceById(old, ctx.tempId, vm));
      }
      toast.success('VM creada');
    },
    onSettled: (_data, error) => {
      // Tras error la caché ya revirtió el elemento; invalidar con la API caída
      // vaciaría el listado (isError). Solo reconciliar en éxito.
      if (!error) {
        maybeInvalidateVms(queryClient);
      }
    },
  });
}

export function useUpdateVm() {
  const queryClient = useQueryClient();
  const { saveDraft } = useVmDraft();

  return useMutation({
    mutationKey: [...vmsMutationKey, 'update'],
    mutationFn: ({ id, input }: { id: string; input: VmInput; successToast?: string }) =>
      api.updateVm(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: vmsQueryKey });
      const list = getVmsCache(queryClient);
      const previous = list.find((vm) => vm.id === id);
      if (!previous) {
        return { previous: undefined, id };
      }
      const optimistic: VmView = {
        ...previous,
        ...input,
        pending: 'update',
        updatedAt: new Date().toISOString(),
      };
      setVmsCache(queryClient, (old) => replaceById(old, id, optimistic));
      return { previous, id };
    },
    onError: (err, variables, ctx) => {
      if (ctx?.previous) {
        setVmsCache(queryClient, (old) => replaceById(old, ctx.id, ctx.previous!));
      }
      const message = errorMessage(err, 'No se pudo guardar');
      const retriable =
        err instanceof ApiClientError &&
        (err.code === 'VM_NAME_TAKEN' || err.code === 'VALIDATION_ERROR');
      if (retriable) {
        const nameTaken = err.code === 'VM_NAME_TAKEN';
        saveDraft({
          kind: 'update',
          values: variables.input,
          vmId: variables.id,
          ...(nameTaken ? { nameTaken: true } : {}),
        });
        toastReturnToForm(message, `/vms/${variables.id}/edit`);
        return;
      }
      toast.error(message, { duration: Infinity });
    },
    onSuccess: (vm, variables) => {
      setVmsCache(queryClient, (old) => replaceById(old, variables.id, vm));
      toast.success(variables.successToast ?? `«${vm.name}» actualizada`);
    },
    onSettled: (_data, error) => {
      if (!error) {
        maybeInvalidateVms(queryClient);
      }
    },
  });
}

export function useDeleteVm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...vmsMutationKey, 'delete'],
    mutationFn: (id: string) => api.deleteVm(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: vmsQueryKey });
      const list = getVmsCache(queryClient);
      const index = findIndexById(list, id);
      const previous = index >= 0 ? list[index] : undefined;
      if (previous) {
        setVmsCache(queryClient, (old) => removeById(old, id));
      }
      return { previous, index };
    },
    onError: (err, id, ctx) => {
      const notFound =
        err instanceof ApiClientError &&
        (err.status === 404 || err.code === 'VM_NOT_FOUND');
      if (notFound) {
        void queryClient.refetchQueries({ queryKey: vmsQueryKey });
        toast.info('Esta VM ya había sido eliminada', { duration: 8000 });
        return;
      }
      if (ctx?.previous && ctx.index >= 0) {
        setVmsCache(queryClient, (old) => restoreAt(old, ctx.index, ctx.previous!));
      }
      toast.error(errorMessage(err, 'No se pudo eliminar la VM'), { duration: Infinity });
    },
    onSuccess: () => {
      toast.success('VM eliminada');
    },
    onSettled: (_data, error) => {
      // 404 ya hace refetchQueries; otros errores restauran el elemento
      if (!error) {
        maybeInvalidateVms(queryClient);
      }
    },
  });
}

export function vmToInput(vm: Vm): VmInput {
  return {
    name: vm.name,
    cores: vm.cores,
    ram: vm.ram,
    disk: vm.disk,
    os: vm.os,
    status: vm.status,
  };
}
