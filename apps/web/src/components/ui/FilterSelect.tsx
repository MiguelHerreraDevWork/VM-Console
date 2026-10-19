'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown } from 'lucide-react';
import { useId } from 'react';

import { cn } from '../../lib/cn';
import { controlClasses } from './field';

/**
 * Selector compacto para filtros (no para formularios). Sustituye al `<select>` nativo, cuyo
 * menú desplegable dibuja el navegador o el sistema: tamaño, tipografía y posición no se
 * pueden ajustar con CSS. Radix DropdownMenu con RadioGroup aporta teclado (flechas, búsqueda
 * por letras, Escape devuelve el foco), reposicionamiento dentro de la pantalla y estilos
 * del tema. El nombre accesible del botón combina la etiqueta y el valor elegido.
 */
export function FilterSelect<T extends string>({
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
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const valueId = `${baseId}-value`;
  const triggerId = `${baseId}-trigger`;
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label id={labelId} htmlFor={triggerId} className="text-sm font-medium text-[var(--text)]">
        {label}
      </label>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger
          id={triggerId}
          aria-labelledby={`${labelId} ${valueId}`}
          className={cn(
            controlClasses(),
            'flex cursor-pointer items-center justify-between gap-2 px-3 text-left text-sm font-medium',
            'data-[state=open]:border-[var(--accent)]',
          )}
        >
          <span id={valueId} data-value-text className="min-w-0 truncate">
            {selected?.label}
          </span>
          <ChevronDown aria-hidden className="size-4 shrink-0 text-[var(--muted)]" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={6}
            collisionPadding={12}
            aria-labelledby={labelId}
            className={cn(
              'menu-anim z-50 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-pop)]',
              // Tan ancho como el botón, sin salir del espacio disponible en pantalla.
              'w-[var(--radix-dropdown-menu-trigger-width)] min-w-44',
              'max-w-[var(--radix-dropdown-menu-content-available-width)] max-h-[var(--radix-dropdown-menu-content-available-height)]',
            )}
          >
            <DropdownMenu.RadioGroup value={value} onValueChange={(next) => onChange(next as T)}>
              {options.map((option) => (
                <DropdownMenu.RadioItem
                  key={option.value}
                  value={option.value}
                  className={cn(
                    'flex min-h-10 cursor-pointer select-none items-center gap-2 rounded-[var(--radius-sm)] px-2.5 text-sm pointer-coarse:min-h-11',
                    // Teclado: mismo anillo de foco que el resto de la app; ratón: solo tinte.
                    'outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--focus)]',
                    'text-[var(--text)] data-[highlighted]:bg-[var(--accent-soft)] data-[state=checked]:font-semibold',
                  )}
                >
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <DropdownMenu.ItemIndicator>
                      <Check aria-hidden className="size-4 text-[var(--accent-hover)]" />
                    </DropdownMenu.ItemIndicator>
                  </span>
                  <span className="min-w-0 truncate">{option.label}</span>
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
