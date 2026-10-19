import {
  vmListResponseSchema,
  vmSchema,
  type Vm,
  type VmInput,
  type VmListResponse,
} from '@repo/contracts';

import { apiFetch } from '../../lib/api-client';

export async function fetchVms(): Promise<Vm[]> {
  const data = await apiFetch<VmListResponse>('/vms');
  return vmListResponseSchema.parse(data).items;
}

export async function createVm(input: VmInput): Promise<Vm> {
  const data = await apiFetch<Vm>('/vms', { method: 'POST', body: input });
  return vmSchema.parse(data);
}

export async function updateVm(id: string, input: VmInput): Promise<Vm> {
  const data = await apiFetch<Vm>(`/vms/${id}`, { method: 'PUT', body: input });
  return vmSchema.parse(data);
}

export async function deleteVm(id: string): Promise<void> {
  await apiFetch<void>(`/vms/${id}`, { method: 'DELETE' });
}
