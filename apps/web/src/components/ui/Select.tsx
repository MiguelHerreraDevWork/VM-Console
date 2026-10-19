import type { SelectHTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string | undefined;
  options: Array<{ value: string; label: string }>;
};

export function Select({ className, label, error, options, id, ...props }: SelectProps) {
  const selectId = id ?? props.name;
  const errorId = error && selectId ? `${selectId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-[var(--text)]">
        {label}
      </label>
      <select
        id={selectId}
        className={cn(
          'min-h-11 w-full appearance-none rounded-[var(--radius-md)] border bg-[var(--surface-2)] px-3 text-[var(--text)]',
          'border-[var(--border)] focus-visible:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]',
          error && 'border-[var(--danger)]',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-[var(--danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
