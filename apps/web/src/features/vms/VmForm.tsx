'use client';

import { VM_OS_OPTIONS, vmInputSchema, vmNameKey, type VmInput } from '@repo/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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

export const defaultVmValues: VmInput = {
  name: '',
  cores: 2,
  ram: 4,
  disk: 40,
  os: 'Ubuntu',
  status: 'OFF',
};

function fieldError(
  errors: FieldErrors<VmInput>,
  name: keyof VmInput,
  touched: boolean | undefined,
  dirty: boolean | undefined,
): string | undefined {
  const err = errors[name];
  // server / duplicate: visibles al recuperar un borrador tras 409
  if (err?.type === 'server' || err?.type === 'duplicate') {
    return typeof err.message === 'string' ? err.message : undefined;
  }
  if (!touched && !dirty) {
    return undefined;
  }
  return typeof err?.message === 'string' ? err.message : undefined;
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
    formState: { errors, isValid, touchedFields, dirtyFields },
  } = useForm<VmInput>({
    resolver: zodResolver(vmInputSchema),
    defaultValues,
    mode: 'onChange',
  });

  const nameValue = useWatch({ control, name: 'name' });
  const [nameBaseline] = useState(defaultValues.name);

  useEffect(() => {
    if (!initialNameTaken) {
      return;
    }
    setError('name', {
      type: 'server',
      message: 'Ya existe una VM con ese nombre (sin distinguir mayúsculas).',
    });
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
      setError('name', {
        type: 'duplicate',
        message: 'Ya existe una VM con ese nombre (sin distinguir mayúsculas).',
      });
    } else if (errors.name?.type === 'duplicate') {
      clearErrors('name');
    }
  }, [nameValue, takenNameKeys, excludeNameKey, setError, clearErrors, errors.name?.type]);

  return (
    <form
      className="mx-auto flex max-w-xl flex-col gap-5"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values, { setError });
      })}
      noValidate
    >
      <Input
        label="Nombre"
        hint="Letras (incluidas acentos y ñ), números, espacios y guion. Entre 3 y 50 caracteres."
        error={fieldError(errors, 'name', touchedFields.name, dirtyFields.name)}
        autoComplete="off"
        {...register('name')}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <NumberInput
          label="vCPU"
          unit="vCPU"
          inputMode="numeric"
          min={1}
          max={64}
          step={1}
          error={fieldError(errors, 'cores', touchedFields.cores, dirtyFields.cores)}
          {...register('cores', { valueAsNumber: true })}
        />
        <NumberInput
          label="RAM"
          unit="GB"
          inputMode="numeric"
          min={1}
          max={512}
          step={1}
          error={fieldError(errors, 'ram', touchedFields.ram, dirtyFields.ram)}
          {...register('ram', { valueAsNumber: true })}
        />
        <NumberInput
          label="Disco"
          unit="GB"
          inputMode="numeric"
          min={10}
          max={4096}
          step={1}
          error={fieldError(errors, 'disk', touchedFields.disk, dirtyFields.disk)}
          {...register('disk', { valueAsNumber: true })}
        />
      </div>
      <p className="text-xs text-[var(--muted)]">
        Rangos: vCPU 1–64 · RAM 1–512 GB · disco 10–4096 GB. Solo enteros.
      </p>

      <Select
        label="Sistema operativo"
        options={VM_OS_OPTIONS.map((os) => ({ value: os, label: os }))}
        error={fieldError(errors, 'os', touchedFields.os, dirtyFields.os)}
        {...register('os')}
      />

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <SegmentedControl
            label="Estado"
            value={field.value}
            onChange={field.onChange}
            options={[
              { value: 'ON', label: 'Encendida' },
              { value: 'OFF', label: 'Apagada' },
            ]}
          />
        )}
      />

      <div className="flex flex-wrap gap-3 pt-2">
        <Button
          type="submit"
          disabled={!isValid || pending || errors.name?.type === 'duplicate' || errors.name?.type === 'server'}
        >
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
