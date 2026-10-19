import type { Vm } from '@repo/contracts';
import { VM_UPDATED_EVENT } from '@repo/contracts';
import type { Server } from 'socket.io';

let io: Server | null = null;

export function setRealtimeServer(server: Server | null) {
  io = server;
}

export function getRealtimeServer(): Server | null {
  return io;
}

/** Emit only after a persisted status change (caller checks status). */
export function emitVmUpdated(vm: Vm): void {
  io?.emit(VM_UPDATED_EVENT, { vm });
}
