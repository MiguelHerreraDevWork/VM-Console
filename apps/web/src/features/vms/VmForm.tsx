'use client';

import { VM_OS_OPTIONS, vmInputSchema, vmNameKey, type VmInput } from '@repo/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Controller,
  useForm,
  useWatch,
  type FieldErrors,
  type UseFormSetError,
} from 'react-hook-form';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { NumberInput } from '../../components/ui/NumberInput';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Select } from '../../components/ui/Select';
import { cn } from '../../lib/cn';

export const defaultVmValues: VmInput = {
  name: '',
  cores: 2,
  ram: 4,
  disk: 40,
  os: 'Ubuntu',
  status: 'OFF',
};

const DUPLICATE_MESSAGE = 'Ya existe una VM con ese nombre (sin distinguir mayúsculas).';

/**
 * Validación en tiempo real (mode onChange), pero el mensaje aparece cuando el campo
 * se ha tocado o tras intentar enviar; los errores de servidor/duplicado se ven siempre.
 */
function fieldError(
  errors: FieldErrors<VmInput>,
  name: keyof VmInput,
  visible: boolean,
): string | undefined {
  const err = errors[name];
  if (err?.type === 'server' || err?.type === 'duplicate') {
    return typeof err.message === 'string' ? err.message : undefined;
  }
  if (!visible) {
    return undefined;
  }
  return typeof err?.message === 'string' ? err.message : undefined;
}

function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset
      className={cn(
        'flex flex-col gap-4 border-t border-[var(--border)] px-5 py-6 first:border-t-0 sm:px-6',
        className,
      )}
    >
      <legend className="float-left w-full text-base font-semibold tracking-tight text-[var(--text)]">
        {title}
        {description ? (
          <span className="mt-1 block text-sm font-normal tracking-normal text-[var(--muted)]">
            {description}
          </span>
        ) : null}
      </legend>
      {children}
    </fieldset>
  );
}

export type VmFormSubmitHelpers = {
  setError: UseFormSetError<VmInput>;
};

export function VmForm({
  defaultValues = defaultVmValues,
  submitLabel,
  pending,
  excludeNameKey,
  takenNameKeys,
  initialNameTaken,
  onCancel,
  onSubmit,
}: {
  defaultValues?: VmInput;
  submitLabel: string;
  pending?: boolean | undefined;
  /** Clave del nombre actual en edición (no marcar como duplicado a sí mismo). */
  excludeNameKey?: string | undefined;
  /** Claves `vmNameKey` ya ocupadas (caché local). */
  takenNameKeys?: Set<string> | undefined;
  /** Tras un 409, marcar el campo name al abrir el formulario. */
  initialNameTaken?: boolean | undefined;
  onCancel?: (() => void) | undefined;
  onSubmit: (values: VmInput, helpers: VmFormSubmitHelpers) => Promise<void> | void;
}) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, touchedFields, dirtyFields, submitCount },
  } = useForm<VmInput>({
    resolver: zodResolver(vmInputSchema),
    defaultValues,
    mode: 'onChange',
  });

  const nameValue = useWatch({ control, name: 'name' });
  const [nameBaseline] = useState(defaultValues.name);
  const submitted = submitCount > 0;
  const visible = (name: keyof VmInput) =>
    submitted || Boolean(touchedFields[name]) || Boolean(dirtyFields[name]);

  useEffect(() => {
    if (!initialNameTaken) {
      return;
    }
    setError('name', { type: 'server', message: DUPLICATE_MESSAGE });
  }, [initialNameTaken, setError]);

  useEffect(() => {
    if (errors.name?.type === 'server' && nameValue !== nameBaseline) {
      clearErrors('name');
    }
  }, [nameValue, nameBaseline, errors.name?.type, clearErrors]);

  useEffect(() => {
    if (!takenNameKeys || !nameValue || nameValue.trim().length < 3) {
      return;
    }
    const key = vmNameKey(nameValue);
    if (excludeNameKey && key === excludeNameKey) {
      if (errors.name?.type === 'duplicate') {
        clearErrors('name');
      }
      return;
    }
    if (takenNameKeys.has(key)) {
      setError('name', { type: 'duplicate', message: DUPLICATE_MESSAGE });
    } else if (errors.name?.type === 'duplicate') {
      clearErrors('name');
    }
  }, [nameValue, takenNameKeys, excludeNameKey, setError, clearErrors, errors.name?.type]);

  return (
    <form
      className="flex max-w-3xl flex-col gap-6"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values, { setError });
      })}
      noValidate
    >
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
        <FormSection title="Identificación">
          <div className="grid gap-4 sm:grid-cols-[3fr_2fr]">
            <Input
              label="Nombre"
              hint="3–50 caracteres: letras (con acentos y ñ), números, espacios y guion."
              error={fieldError(errors, 'name', visible('name'))}
              autoComplete="off"
              spellCheck={false}
              {...register('name')}
            />
            <Select
              label="Sistema operativo"
              options={VM_OS_OPTIONS.map((os) => ({ value: os, label: os }))}
              error={fieldError(errors, 'os', visible('os'))}
              {...register('os')}
            />
          </div>
        </FormSection>

        <FormSection
          title="Recursos asignados"
          description="Valores enteros. Cuentan en el panel solo mientras la VM está encendida."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberInput
              label="vCPU"
              unit="vCPU"
              hint="Entre 1 y 64"
              inputMode="numeric"
              min={1}
              max={64}
              step={1}
              error={fieldError(errors, 'cores', visible('cores'))}
              {...register('cores', { valueAsNumber: true })}
            />
            <NumberInput
              label="RAM"
              unit="GB"
              hint="Entre 1 y 512 GB"
              inputMode="numeric"
              min={1}
              max={512}
              step={1}
              error={fieldError(errors, 'ram', visible('ram'))}
              {...register('ram', { valueAsNumber: true })}
            />
            <NumberInput
              label="Disco"
              unit="GB"
              hint="Entre 10 y 4096 GB"
              inputMode="numeric"
              min={10}
              max={4096}
              step={1}
              error={fieldError(errors, 'disk', visible('disk'))}
              {...register('disk', { valueAsNumber: true })}
            />
          </div>
        </FormSection>

        <FormSection title="Estado">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <SegmentedControl
                label="Estado de la VM"
                hideLabel
                value={field.value}
                onChange={field.onChange}
                options={[
                  {
                    value: 'ON',
                    label: 'Encendida',
                    icon: <span aria-hidden className="size-2 rounded-full bg-[var(--success)]" />,
                  },
                  {
                    value: 'OFF',
                    label: 'Apagada',
                    icon: (
                      <span
                        aria-hidden
                        className="size-2 rounded-full border border-[var(--muted)]"
                      />
                    ),
                  },
                ]}
              />
            )}
          />
        </FormSection>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={Boolean(pending)}>
          {pending ? 'Guardando…' : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" disabled={pending} onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
