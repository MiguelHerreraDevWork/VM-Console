import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

const tones = {
  default: 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]',
  accent: 'bg-[var(--surface-2)] text-[var(--accent-2)] border-[var(--accent)]/40',
  success: 'bg-[var(--surface-2)] text-[var(--success)] border-[var(--success)]/40',
  danger: 'bg-[var(--surface-2)] text-[var(--danger)] border-[var(--danger)]/40',
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
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
