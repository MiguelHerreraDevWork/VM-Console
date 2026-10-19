'use client';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useRef, useState, type ReactNode } from 'react';

import { DraftNavBridge } from '../features/vms/DraftNavBridge';
import { VmDraftProvider } from '../features/vms/VmDraftProvider';
import { ApiClientError } from '../lib/api-client';

export function Providers({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession?: unknown;
}) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const [queryClient] = useState(() => {
    const client = new QueryClient({
      queryCache: new QueryCache({
        onError: (error) => {
          if (error instanceof ApiClientError && error.status === 401) {
            client.clear();
            const next = encodeURIComponent(
              typeof window !== 'undefined'
                ? window.location.pathname + window.location.search
                : '/dashboard',
            );
            routerRef.current.replace(`/login?next=${next}`);
          }
        },
      }),
      mutationCache: new MutationCache({
        onError: (error) => {
          if (error instanceof ApiClientError && error.status === 401) {
            client.clear();
            const next = encodeURIComponent(
              typeof window !== 'undefined'
                ? window.location.pathname + window.location.search
                : '/dashboard',
            );
            routerRef.current.replace(`/login?next=${next}`);
          }
        },
      }),
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    });
    if (initialSession !== undefined) {
      client.setQueryData(['session'], initialSession);
    }
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <VmDraftProvider>
        <DraftNavBridge />
        {children}
      </VmDraftProvider>
    </QueryClientProvider>
  );
}
