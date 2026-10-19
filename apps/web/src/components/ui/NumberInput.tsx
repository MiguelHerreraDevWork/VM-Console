import type { InputHTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

export type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
  unit: string;
  error?: string | undefined;
};

export function NumberInput({ className, label, unit, error, id, ...props }: NumberInputProps) {
  const inputId = id ?? props.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-[var(--text)]">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="number"
          className={cn(
            'min-h-11 w-full rounded-[var(--radius-md)] border bg-[var(--surface-2)] py-2 pl-3 pr-14 text-[var(--text)]',
            'border-[var(--border)] focus-visible:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]',
            error && 'border-[var(--danger)]',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          {...props}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-[var(--muted)]">
          {unit}
        </span>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-[var(--danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
