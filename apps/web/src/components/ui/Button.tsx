import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

const buttonVariants = cva(
  'press inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--accent)] text-[var(--on-accent)] shadow-sm hover:bg-[var(--accent-hover)]',
        secondary:
          'border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]',
        ghost:
          'bg-transparent text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
        danger:
          'bg-[var(--danger-solid)] text-[var(--on-danger)] hover:bg-[var(--danger-solid-hover)]',
      },
      size: {
        md: 'min-h-11 px-4 py-2 text-sm',
        sm: 'min-h-10 px-3 py-1.5 text-sm',
        icon: 'size-11 p-0',
        'icon-sm': 'size-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Acción en curso: muestra un indicador circular y bloquea el doble envío. */
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (asChild) {
    return (
      <Slot className={classes} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
