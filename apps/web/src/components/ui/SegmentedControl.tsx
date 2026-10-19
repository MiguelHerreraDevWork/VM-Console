'use client';

import { cn } from '../../lib/cn';

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="text-sm font-medium text-[var(--text)]">{label}</legend>
      <div
        role="group"
        aria-label={label}
        className="inline-flex min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] p-1"
      >
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(opt.value)}
              className={cn(
                'min-h-9 min-w-20 cursor-pointer rounded-[var(--radius-sm)] px-3 text-sm font-medium transition-colors',
                selected
                  ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
