import type { Vm } from '@repo/contracts';

import type { VmView } from '../../vms/types';

export type ReconcileDecision = 'replace' | 'ignore' | 'invalidate';

/**
 * Decide how to apply a remote `vm:updated` against the local cache.
 * - ignore: local mutation in flight for that id, or stale updatedAt
 * - invalidate: id unknown (do not insert — altas are out of realtime scope)
 * - replace: apply replaceById
 */
export function decideVmUpdate(
  cache: readonly VmView[],
  vm: Vm,
): ReconcileDecision {
  const existing = cache.find((item) => item.id === vm.id);
  if (!existing) {
    return 'invalidate';
  }
  if (existing.pending) {
    return 'ignore';
  }
  const incoming = Date.parse(vm.updatedAt);
  const current = Date.parse(existing.updatedAt);
  if (Number.isFinite(incoming) && Number.isFinite(current) && incoming < current) {
    return 'ignore';
  }
  return 'replace';
}
