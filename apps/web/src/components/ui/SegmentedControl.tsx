'use client';

import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '../../lib/cn';

/** Grupo de opciones exclusivas (radiogroup) con foco itinerante y flechas. */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  hideLabel = false,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string; icon?: ReactNode }>;
  onChange: (value: T) => void;
  hideLabel?: boolean;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const labelId = useId();

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (delta === 0) {
      return;
    }
    event.preventDefault();
    const next = (index + delta + options.length) % options.length;
    const option = options[next];
    if (option) {
      onChange(option.value);
      refs.current[next]?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span
        id={labelId}
        className={cn('text-sm font-medium text-[var(--text)]', hideLabel && 'sr-only')}
      >
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="inline-flex w-fit gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] p-1"
      >
        {options.map((opt, index) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(opt.value)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                'press inline-flex min-h-9 min-w-20 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-sm)] px-3 text-sm font-medium',
                selected
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm ring-1 ring-[var(--border-strong)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]',
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
