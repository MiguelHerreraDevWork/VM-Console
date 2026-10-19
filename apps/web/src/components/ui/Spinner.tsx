import { LoaderCircle } from 'lucide-react';

import { cn } from '../../lib/cn';

/**
 * Indicador circular de una espera real. Con movimiento reducido gira más despacio
 * (menos movimiento, no cero): sigue siendo la señal de que algo está en curso y
 * siempre va acompañado de texto, así que la información no depende del giro.
 */
export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <>
      <LoaderCircle
        aria-hidden
        className={cn(
          'size-4 shrink-0 animate-spin motion-reduce:animate-[spin_1.6s_linear_infinite]',
          className,
        )}
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </>
  );
}
