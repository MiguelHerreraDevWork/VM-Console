import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-2)] motion-reduce:animate-none',
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}
