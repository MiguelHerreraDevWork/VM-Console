'use client';

import type { SessionUser } from '@repo/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';

import { sessionQueryKey } from './hooks';

/**
 * Siembra la sesión validada en el servidor **antes** del primer render de los hijos,
 * para que `RoleGate` decida desde el HTML inicial (sin aparición tardía de acciones).
 */
export function SessionHydration({ user, children }: { user: SessionUser; children: ReactNode }) {
  const queryClient = useQueryClient();

  useState(() => {
    // Solo antes del primer render de los hijos: nadie está suscrito aún a ['session'].
    const current = queryClient.getQueryData<SessionUser | null>(sessionQueryKey);
    if (current?.id !== user.id || current.role !== user.role) {
      queryClient.setQueryData(sessionQueryKey, user);
    }
    return true;
  });

  useEffect(() => {
    queryClient.setQueryData(sessionQueryKey, user);
  }, [queryClient, user]);

  return children;
}
