'use client';

import type { VmInput } from '@repo/contracts';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type VmDraftKind = 'create' | 'update';

export type VmDraft = {
  kind: VmDraftKind;
  values: VmInput;
  /** Id de la VM en edición (solo kind=update). */
  vmId?: string;
  /** Marcar el campo name tras un 409. */
  nameTaken?: boolean;
};

type VmDraftContextValue = {
  draft: VmDraft | null;
  saveDraft: (draft: VmDraft) => void;
  clearDraft: () => void;
  /** Lee y limpia el borrador si coincide con `kind` (y opcionalmente `vmId`). */
  consumeDraft: (kind: VmDraftKind, vmId?: string) => VmDraft | null;
};

const VmDraftContext = createContext<VmDraftContextValue | null>(null);

export function VmDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<VmDraft | null>(null);
  const draftRef = useRef<VmDraft | null>(null);
  draftRef.current = draft;

  const saveDraft = useCallback((next: VmDraft) => {
    draftRef.current = next;
    setDraft(next);
  }, []);

  const clearDraft = useCallback(() => {
    draftRef.current = null;
    setDraft(null);
  }, []);

  const consumeDraft = useCallback((kind: VmDraftKind, vmId?: string) => {
    const current = draftRef.current;
    if (!current || current.kind !== kind) {
      return null;
    }
    if (kind === 'update' && vmId !== undefined && current.vmId !== vmId) {
      return null;
    }
    draftRef.current = null;
    setDraft(null);
    return current;
  }, []);

  const value = useMemo(
    () => ({ draft, saveDraft, clearDraft, consumeDraft }),
    [draft, saveDraft, clearDraft, consumeDraft],
  );

  return <VmDraftContext.Provider value={value}>{children}</VmDraftContext.Provider>;
}

export function useVmDraft(): VmDraftContextValue {
  const ctx = useContext(VmDraftContext);
  if (!ctx) {
    throw new Error('useVmDraft debe usarse dentro de VmDraftProvider');
  }
  return ctx;
}
