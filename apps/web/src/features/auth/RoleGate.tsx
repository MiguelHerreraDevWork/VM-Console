'use client';

import type { ReactNode } from 'react';

import { can, type Action } from './can';
import { useSession } from './hooks';

export function RoleGate({ action, children }: { action: Action; children: ReactNode }) {
  const { role } = useSession();
  if (!can(role, action)) {
    return null;
  }
  return children;
}
