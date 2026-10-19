'use client';

import type { SessionUser } from '@repo/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';

import { sessionQueryKey } from './hooks';

export function SessionHydration({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.setQueryData(sessionQueryKey, user);
  }, [queryClient, user]);

  return children;
}
