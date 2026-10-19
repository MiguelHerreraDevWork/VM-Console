import type { Vm } from '@repo/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError } from '../../lib/api-client';
import * as api from './api';
import { useCreateVm, useDeleteVm, useUpdateVm, vmsQueryKey, vmToInput } from './hooks';
import type { VmView } from './types';
import { VmDraftProvider } from './VmDraftProvider';

vi.mock('./api', () => ({
  fetchVms: vi.fn(),
  createVm: vi.fn(),
  updateVm: vi.fn(),
  deleteVm: vi.fn(),
}));

const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock('sonner', () => ({ toast: toastMock }));

const off: Vm = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'web-01',
  cores: 2,
  ram: 4,
  disk: 40,
  os: 'Ubuntu',
  status: 'OFF',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};
const other: Vm = { ...off, id: '00000000-0000-4000-8000-000000000002', name: 'db-01' };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData<VmView[]>(vmsQueryKey, [off, other]);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <VmDraftProvider>{children}</VmDraftProvider>
    </QueryClientProvider>
  );
  const cache = () => client.getQueryData<VmView[]>(vmsQueryKey) ?? [];
  return { client, wrapper, cache };
}

const serverError = () =>
  new ApiClientError(500, { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.fetchVms).mockResolvedValue([off, other]);
});

describe('encender/apagar optimista', () => {
  it('muestra «Encendiendo…» con el estado nuevo y revierte si la API falla', async () => {
    const { wrapper, cache } = setup();
    const call = deferred<Vm>();
    vi.mocked(api.updateVm).mockReturnValue(call.promise);
    const { result } = renderHook(() => useUpdateVm(), { wrapper });

    act(() => {
      result.current.mutate({
        id: off.id,
        input: { ...vmToInput(off), status: 'ON' },
        intent: 'power',
      });
    });

    await waitFor(() => expect(cache()[0]?.pending).toBe('power-on'));
    expect(cache()[0]?.status).toBe('ON');
    expect(cache()[1]?.pending).toBeUndefined(); // las demás VMs siguen operables

    await act(async () => {
      call.reject(serverError());
    });

    await waitFor(() => expect(cache()[0]?.pending).toBeUndefined());
    expect(cache()[0]?.status).toBe('OFF');
    expect(toastMock.error).toHaveBeenCalledWith(
      expect.stringContaining('No se pudo encender «web-01»'),
      expect.anything(),
    );
  });

  it('al confirmarse quita el pendiente y confirma con toast', async () => {
    const { wrapper, cache } = setup();
    vi.mocked(api.updateVm).mockResolvedValue({ ...off, status: 'ON' });
    const { result } = renderHook(() => useUpdateVm(), { wrapper });

    act(() => {
      result.current.mutate({
        id: off.id,
        input: { ...vmToInput(off), status: 'ON' },
        intent: 'power',
      });
    });

    await waitFor(() => expect(toastMock.success).toHaveBeenCalledWith('«web-01» encendida'));
    expect(cache()[0]).toMatchObject({ status: 'ON' });
    expect(cache()[0]?.pending).toBeUndefined();
  });

  it('apagar marca «power-off»', async () => {
    const { wrapper, cache, client } = setup();
    client.setQueryData<VmView[]>(vmsQueryKey, [{ ...off, status: 'ON' }]);
    vi.mocked(api.updateVm).mockReturnValue(deferred<Vm>().promise);
    const { result } = renderHook(() => useUpdateVm(), { wrapper });

    act(() => {
      result.current.mutate({
        id: off.id,
        input: { ...vmToInput(off), status: 'OFF' },
        intent: 'power',
      });
    });

    await waitFor(() => expect(cache()[0]?.pending).toBe('power-off'));
  });
});

describe('eliminar optimista', () => {
  it('mantiene la fila marcada «Eliminando…» y la retira al confirmarse', async () => {
    const { wrapper, cache } = setup();
    const call = deferred<void>();
    vi.mocked(api.deleteVm).mockReturnValue(call.promise);
    const { result } = renderHook(() => useDeleteVm(), { wrapper });

    act(() => {
      result.current.mutate(off.id);
    });

    await waitFor(() => expect(cache()[0]?.pending).toBe('delete'));
    expect(cache()).toHaveLength(2);

    await act(async () => {
      call.resolve();
    });

    await waitFor(() => expect(cache().map((vm) => vm.id)).toEqual([other.id]));
    expect(toastMock.success).toHaveBeenCalledWith('«web-01» eliminada');
  });

  it('restaura la fila en su sitio si la API falla', async () => {
    const { wrapper, cache } = setup();
    vi.mocked(api.deleteVm).mockRejectedValue(serverError());
    const { result } = renderHook(() => useDeleteVm(), { wrapper });

    act(() => {
      result.current.mutate(off.id);
    });

    await waitFor(() => expect(toastMock.error).toHaveBeenCalled());
    expect(cache().map((vm) => vm.id)).toEqual([off.id, other.id]);
    expect(cache()[0]?.pending).toBeUndefined();
  });

  it('con 404 la retira sin restaurarla y avisa', async () => {
    const { wrapper, cache } = setup();
    vi.mocked(api.fetchVms).mockResolvedValue([other]);
    vi.mocked(api.deleteVm).mockRejectedValue(
      new ApiClientError(404, { code: 'VM_NOT_FOUND', message: 'VM no encontrada' }),
    );
    const { result } = renderHook(() => useDeleteVm(), { wrapper });

    act(() => {
      result.current.mutate(off.id);
    });

    await waitFor(() => expect(toastMock.info).toHaveBeenCalled());
    expect(cache().some((vm) => vm.id === off.id)).toBe(false);
  });
});

describe('crear optimista', () => {
  it('añade la VM como «Creando…» y la retira si la API falla', async () => {
    const { wrapper, cache } = setup();
    const call = deferred<Vm>();
    vi.mocked(api.createVm).mockReturnValue(call.promise);
    const { result } = renderHook(() => useCreateVm(), { wrapper });

    act(() => {
      result.current.mutate({ ...vmToInput(off), name: 'nueva-01' });
    });

    await waitFor(() => expect(cache()[0]).toMatchObject({ name: 'nueva-01', pending: 'create' }));

    await act(async () => {
      call.reject(serverError());
    });

    await waitFor(() => expect(cache().some((vm) => vm.name === 'nueva-01')).toBe(false));
    expect(toastMock.error).toHaveBeenCalled();
  });
});
