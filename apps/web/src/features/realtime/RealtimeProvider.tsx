'use client';

import {
  VM_UPDATED_EVENT,
  vmUpdatedPayloadSchema,
  type Vm,
} from '@repo/contracts';
import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';

import { getPublicApiUrl } from '../../lib/api-url';
import { replaceById } from '../vms/lib/cache';
import { vmsQueryKey } from '../vms/hooks';
import type { VmView } from '../vms/types';
import { useSession } from '../auth/hooks';
import { connectionLabel, type ConnectionStatus } from './connection';
import { decideVmUpdate } from './lib/reconcile';

type RealtimeContextValue = {
  status: ConnectionStatus;
  statusLabel: string;
  highlightedIds: ReadonlySet<string>;
  announcement: string;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const HIGHLIGHT_MS = 1500;

function statusAnnouncement(vm: Vm): string {
  const label = vm.status === 'ON' ? 'Encendida' : 'Apagada';
  return `${vm.name} ahora está ${label}`;
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConnectionStatus>('offline');
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(() => new Set());
  const [announcement, setAnnouncement] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const everConnectedRef = useRef(false);
  const highlightTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const markHighlighted = useCallback((id: string, message: string) => {
    setHighlightedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setAnnouncement(message);
    const existing = highlightTimers.current.get(id);
    if (existing) {
      clearTimeout(existing);
    }
    const timer = setTimeout(() => {
      setHighlightedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      highlightTimers.current.delete(id);
    }, HIGHLIGHT_MS);
    highlightTimers.current.set(id, timer);
  }, []);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      everConnectedRef.current = false;
      setStatus('offline');
      return;
    }

    const socket = io(getPublicApiUrl(), {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 5000,
    });
    socketRef.current = socket;
    setStatus('reconnecting');

    socket.on('connect', () => {
      setStatus('live');
      if (everConnectedRef.current) {
        void queryClient.invalidateQueries({ queryKey: vmsQueryKey });
      }
      everConnectedRef.current = true;
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io client disconnect') {
        setStatus('offline');
      } else {
        setStatus('reconnecting');
      }
    });

    socket.on('connect_error', () => {
      setStatus('reconnecting');
    });

    socket.on(VM_UPDATED_EVENT, (raw: unknown) => {
      const parsed = vmUpdatedPayloadSchema.safeParse(raw);
      if (!parsed.success) {
        return;
      }
      const { vm } = parsed.data;
      const cache = queryClient.getQueryData<VmView[]>(vmsQueryKey) ?? [];
      const decision = decideVmUpdate(cache, vm);
      if (decision === 'ignore') {
        return;
      }
      if (decision === 'invalidate') {
        void queryClient.invalidateQueries({ queryKey: vmsQueryKey });
        return;
      }
      queryClient.setQueryData<VmView[]>(vmsQueryKey, (old) =>
        replaceById(old ?? [], vm.id, vm),
      );
      markHighlighted(vm.id, statusAnnouncement(vm));
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      for (const timer of highlightTimers.current.values()) {
        clearTimeout(timer);
      }
      highlightTimers.current.clear();
    };
  }, [user, queryClient, markHighlighted]);

  const value = useMemo<RealtimeContextValue>(
    () => ({
      status,
      statusLabel: connectionLabel(status),
      highlightedIds,
      announcement,
    }),
    [status, highlightedIds, announcement],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    return {
      status: 'offline',
      statusLabel: connectionLabel('offline'),
      highlightedIds: new Set(),
      announcement: '',
    };
  }
  return ctx;
}

export function useVmHighlighted(id: string): boolean {
  return useRealtime().highlightedIds.has(id);
}
