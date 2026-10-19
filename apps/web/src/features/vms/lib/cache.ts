import type { VmPending, VmView } from '../types';

export function insertTemp(list: readonly VmView[], item: VmView): VmView[] {
  return [item, ...list];
}

export function replaceById(list: readonly VmView[], id: string, item: VmView): VmView[] {
  return list.map((vm) => (vm.id === id ? item : vm));
}

export function removeById(list: readonly VmView[], id: string): VmView[] {
  return list.filter((vm) => vm.id !== id);
}

export function restoreAt(list: readonly VmView[], index: number, item: VmView): VmView[] {
  const next = [...list];
  const at = Math.max(0, Math.min(index, next.length));
  next.splice(at, 0, item);
  return next;
}

export function markPending(
  list: readonly VmView[],
  id: string,
  pending: VmPending,
): VmView[] {
  return list.map((vm) => (vm.id === id ? { ...vm, pending } : vm));
}

export function findIndexById(list: readonly VmView[], id: string): number {
  return list.findIndex((vm) => vm.id === id);
}
