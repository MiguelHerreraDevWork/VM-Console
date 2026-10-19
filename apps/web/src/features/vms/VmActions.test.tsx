import type { Vm } from '@repo/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { VmActions } from './VmActions';
import { VmDraftProvider } from './VmDraftProvider';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('../auth/hooks', () => ({
  useSession: () => ({
    user: { id: '1', email: 'cliente@demo.local', role: 'CLIENT' },
    role: 'CLIENT',
    isAdmin: false,
    isLoading: false,
  }),
}));

const vm: Vm = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'web-01',
  cores: 2,
  ram: 4,
  disk: 40,
  os: 'Ubuntu',
  status: 'ON',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function wrap(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <VmDraftProvider>{ui}</VmDraftProvider>
    </QueryClientProvider>,
  );
}

describe('VmActions + CLIENT', () => {
  it('no renderiza controles de escritura para CLIENT', () => {
    wrap(<VmActions vm={vm} />);
    expect(screen.queryByRole('button', { name: /encender|apagar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
  });
});
