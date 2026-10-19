import type { Vm } from '@repo/contracts';

import { emitVmUpdated } from '../../realtime/hub.js';

/**
 * Post-update hook: emit Socket.IO `vm:updated` only when status changes.
 */
export async function afterVmUpdate(previous: Vm, updated: Vm): Promise<void> {
  if (previous.status === updated.status) {
    return;
  }
  emitVmUpdated(updated);
}
