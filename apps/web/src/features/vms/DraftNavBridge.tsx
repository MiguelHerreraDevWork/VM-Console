'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { registerDraftNavigator } from './draft-nav';

export function DraftNavBridge() {
  const router = useRouter();

  useEffect(() => {
    return registerDraftNavigator((href) => {
      router.push(href);
    });
  }, [router]);

  return null;
}
