'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from './Button';

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  danger = false,
  trigger,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  danger?: boolean;
  trigger?: ReactNode;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger> : null}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="overlay-anim fixed inset-0 z-50 bg-[var(--overlay)]" />
        <AlertDialog.Content className="modal-anim fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-pop)] focus:outline-none">
          <div className="flex gap-4">
            {danger ? (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--danger)_14%,var(--surface))] text-[var(--danger)]">
                <TriangleAlert aria-hidden className="size-5" />
              </span>
            ) : null}
            <div className="min-w-0">
              <AlertDialog.Title className="text-lg font-semibold text-[var(--text)]">
                {title}
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-1.5 text-sm text-[var(--muted)]">
                {description}
              </AlertDialog.Description>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button type="button" variant="secondary" autoFocus>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button type="button" variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
