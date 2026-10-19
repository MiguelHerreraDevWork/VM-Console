'use client';

import type { Vm, VmInput } from '@repo/contracts';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ApiClientError } from '../../lib/api-client';
import * as api from './api';
import { navigatePreservingDraft } from './draft-nav';
import { insertTemp, markPending, removeById, replaceById } from './lib/cache';
import type { VmPending, VmView } from './types';
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
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: vmsQueryKey,
    queryFn: api.fetchVms,
    // Al volver al listado justo después de guardar, una consulta al montar devolvería la
    // lista del servidor sin el cambio optimista aún en vuelo y lo borraría de la vista.
    // Mientras haya mutaciones de VMs pendientes se usa la caché; onSettled reconcilia después.
    refetchOnMount: () => queryClient.isMutating({ mutationKey: vmsMutationKey }) === 0,
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
      toast.success(`«${vm.name}» creada`);
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

export type UpdateVmVariables = {
  id: string;
  input: VmInput;
  /** `power`: botón rápido de encender/apagar; `edit` (por defecto): formulario. */
  intent?: 'edit' | 'power';
};

/** Estado pendiente que verá el usuario junto a la VM mientras responde la API. */
export function updatePending({ input, intent }: UpdateVmVariables): VmPending {
  if (intent === 'power') {
    return input.status === 'ON' ? 'power-on' : 'power-off';
  }
  return 'update';
}

export function useUpdateVm() {
  const queryClient = useQueryClient();
  const { saveDraft } = useVmDraft();

  return useMutation({
    mutationKey: [...vmsMutationKey, 'update'],
    mutationFn: ({ id, input }: UpdateVmVariables) => api.updateVm(id, input),
    onMutate: async (variables) => {
      const { id, input } = variables;
      await queryClient.cancelQueries({ queryKey: vmsQueryKey });
      const list = getVmsCache(queryClient);
      const previous = list.find((vm) => vm.id === id);
      if (!previous) {
        return { previous: undefined, id };
      }
      const optimistic: VmView = {
        ...previous,
        ...input,
        pending: updatePending(variables),
        updatedAt: new Date().toISOString(),
      };
      setVmsCache(queryClient, (old) => replaceById(old, id, optimistic));
      return { previous, id };
    },
    onError: (err, variables, ctx) => {
      if (ctx?.previous) {
        setVmsCache(queryClient, (old) => replaceById(old, ctx.id, ctx.previous!));
      }
      const name = ctx?.previous?.name ?? variables.input.name;
      if (variables.intent === 'power') {
        const verb = variables.input.status === 'ON' ? 'encender' : 'apagar';
        toast.error(`No se pudo ${verb} «${name}». ${errorMessage(err, 'Inténtalo de nuevo.')}`, {
          duration: Infinity,
        });
        return;
      }
      const message = errorMessage(err, `No se pudo guardar «${name}»`);
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
      if (variables.intent === 'power') {
        toast.success(vm.status === 'ON' ? `«${vm.name}» encendida` : `«${vm.name}» apagada`);
      } else {
        toast.success(`«${vm.name}» actualizada`);
      }
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
    // La fila permanece en su sitio marcada «Eliminando…» (y ya no cuenta en las sumas)
    // hasta que responde la API; entonces se retira o se restaura.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: vmsQueryKey });
      const previous = getVmsCache(queryClient).find((vm) => vm.id === id);
      if (previous) {
        setVmsCache(queryClient, (old) => markPending(old, id, 'delete'));
      }
      return { previous };
    },
    onError: (err, id, ctx) => {
      const name = ctx?.previous?.name ?? 'la VM';
      const notFound =
        err instanceof ApiClientError && (err.status === 404 || err.code === 'VM_NOT_FOUND');
      if (notFound) {
        // Ya no existe en el servidor: se retira sin restaurarla y se reconcilia.
        setVmsCache(queryClient, (old) => removeById(old, id));
        void queryClient.refetchQueries({ queryKey: vmsQueryKey });
        toast.info(`«${name}» ya había sido eliminada`, { duration: 8000 });
        return;
      }
      if (ctx?.previous) {
        setVmsCache(queryClient, (old) => replaceById(old, id, ctx.previous!));
      }
      toast.error(`No se pudo eliminar «${name}». ${errorMessage(err, 'Inténtalo de nuevo.')}`, {
        duration: Infinity,
      });
    },
    onSuccess: (_data, id, ctx) => {
      setVmsCache(queryClient, (old) => removeById(old, id));
      toast.success(`«${ctx?.previous?.name ?? 'VM'}» eliminada`);
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
