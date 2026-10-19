'use client';

import {
  sessionResponseSchema,
  type LoginInput,
  type SessionResponse,
  type SessionUser,
} from '@repo/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { apiFetch } from '../../lib/api-client';

export const sessionQueryKey = ['session'] as const;

export function useSession() {
  const query = useQuery({
    queryKey: sessionQueryKey,
    queryFn: async (): Promise<SessionUser | null> => {
      try {
        const data = await apiFetch<SessionResponse>('/me');
        return sessionResponseSchema.parse(data).user;
      } catch {
        return null;
      }
    },
    staleTime: 30_000,
  });

  const user = query.data ?? null;
  return {
    user,
    role: user?.role,
    isAdmin: user?.role === 'ADMIN',
    isLoading: query.isLoading,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<SessionResponse>('/login', { method: 'POST', body: input }),
    onSuccess: (data) => {
      const parsed = sessionResponseSchema.parse(data);
      queryClient.setQueryData(sessionQueryKey, parsed.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => apiFetch<void>('/logout', { method: 'POST' }),
    onSettled: async () => {
      queryClient.clear();
      router.replace('/login');
      router.refresh();
    },
  });
}
