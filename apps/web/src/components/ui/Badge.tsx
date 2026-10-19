import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

const tones = {
  default: 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]',
  accent:
    'bg-[color-mix(in_srgb,var(--accent-2)_10%,var(--surface))] text-[var(--accent-2)] border-[color-mix(in_srgb,var(--accent-2)_35%,transparent)]',
  success:
    'bg-[color-mix(in_srgb,var(--success)_10%,var(--surface))] text-[var(--success)] border-[color-mix(in_srgb,var(--success)_35%,transparent)]',
  danger:
    'bg-[color-mix(in_srgb,var(--danger)_10%,var(--surface))] text-[var(--danger)] border-[color-mix(in_srgb,var(--danger)_35%,transparent)]',
  muted: 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border)]',
} as const;

export function Badge({
  className,
  tone = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
