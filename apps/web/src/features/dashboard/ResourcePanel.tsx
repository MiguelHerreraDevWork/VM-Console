'use client';

import type { Vm } from '@repo/contracts';
import { ArrowRight, PowerOff } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import { LinkPendingReporter } from '../../components/layout/navigation-pending';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/cn';
import type { ResourceAggregate } from './lib/aggregate-resources';
import { formatCount } from './lib/format';
import { topVmsByMetric } from './lib/top-vms';
import { metricMeta, metricOrder, type Metric } from './metrics';
import { TopVmsList } from './TopVmsList';

const AllocatedResourcesChart = dynamic(
  () => import('./AllocatedResourcesChart').then((mod) => mod.AllocatedResourcesChart),
  { ssr: false, loading: () => <Skeleton className="h-60 w-full" /> },
);

function rankingTitle(count: number, metric: Metric): string {
  const noun = metricMeta[metric].rankingNoun;
  return count === 1
    ? `La VM encendida con más ${noun}`
    : `Las ${count} VMs encendidas con más ${noun}`;
}

/**
 * Resumen de recursos asignados (suma de VMs encendidas). La cabecera lleva el único
 * degradado de acento del Panel; cada recurso es una pestaña que muestra su total y gobierna
 * las dos vistas: reparto por SO y ranking de VMs. Sin porcentajes ni capacidad inventada.
 */
export function ResourcePanel({
  aggregate,
  vms,
}: {
  aggregate: ResourceAggregate;
  vms: readonly (Vm & { pending?: string | undefined })[];
}) {
  const [metric, setMetric] = useState<Metric>('cores');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const { allocated, on, off, total } = aggregate;
  const top = useMemo(() => topVmsByMetric(vms, metric, 5), [vms, metric]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === 'ArrowRight') next = (index + 1) % metricOrder.length;
    else if (event.key === 'ArrowLeft')
      next = (index - 1 + metricOrder.length) % metricOrder.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = metricOrder.length - 1;
    else return;
    event.preventDefault();
    const nextMetric = metricOrder[next];
    if (nextMetric) {
      setMetric(nextMetric);
      tabRefs.current[next]?.focus();
    }
  }

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
    >
      {/* Zona de acento: cabecera + totales. El degradado no se repite en otras tarjetas. */}
      <div className="bg-glow-surface rounded-t-[calc(var(--radius-lg)-1px)]">
        <header className="flex flex-col gap-4 px-5 pt-5 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:pt-6">
          <div>
            <h2 id={`${baseId}-title`} className="text-lg font-semibold tracking-tight">
              Recursos asignados
            </h2>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              Suma de las VMs encendidas. Elige un recurso para ver su reparto.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <div className="flex items-center gap-1.5">
                <dt className="text-[var(--muted)]">Total</dt>
                <dd className="font-semibold tabular-nums">{formatCount(total)} VMs</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <span aria-hidden className="size-2 rounded-full bg-[var(--success)]" />
                <dt className="text-[var(--muted)]">Encendidas</dt>
                <dd className="font-semibold tabular-nums">{formatCount(on)}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <span aria-hidden className="size-2 rounded-full border border-[var(--muted)]" />
                <dt className="text-[var(--muted)]">Apagadas</dt>
                <dd className="font-semibold tabular-nums">{formatCount(off)}</dd>
              </div>
            </dl>
            <Button asChild variant="secondary" size="sm" className="self-start sm:self-end">
              <Link href="/vms">
                Ver inventario
                <ArrowRight aria-hidden className="size-4" />
                <LinkPendingReporter href="/vms" />
              </Link>
            </Button>
          </div>
        </header>

        <div
          role="tablist"
          aria-label="Recurso"
          className="mt-5 grid grid-cols-3 border-t border-[var(--border)]"
        >
          {metricOrder.map((key, index) => {
            const meta = metricMeta[key];
            const Icon = meta.icon;
            const selected = key === metric;
            const value =
              key === 'cores'
                ? allocated.cores
                : key === 'ramGb'
                  ? allocated.ramGb
                  : allocated.diskGb;
            return (
              <button
                key={key}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                id={`${baseId}-tab-${key}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => setMetric(key)}
                onKeyDown={(event) => onKeyDown(event, index)}
                data-kpi={key}
                className={cn(
                  'relative flex cursor-pointer flex-col items-start gap-1 px-4 py-4 text-left transition-colors duration-150 sm:px-6',
                  'border-l border-[var(--border)] first:border-l-0',
                  'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:transition-colors after:duration-150',
                  selected
                    ? 'bg-[var(--accent-soft)] after:bg-[var(--accent)]'
                    : 'after:bg-transparent hover:bg-[color-mix(in_srgb,var(--surface-hover)_70%,transparent)]',
                )}
              >
                <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--muted)]">
                  <Icon
                    aria-hidden
                    className={cn('size-4', selected && 'text-[var(--accent-hover)]')}
                  />
                  {meta.label}
                </span>
                <span className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold tracking-tight tabular-nums text-[var(--text)] sm:text-3xl">
                    {formatCount(value)}
                  </span>
                  <span className="text-sm font-medium text-[var(--muted)]">{meta.unit}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${metric}`}
        className="border-t border-[var(--border)]"
      >
        {on === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <PowerOff aria-hidden className="size-6 text-[var(--muted)]" />
            <p className="font-semibold">No hay VMs encendidas</p>
            <p className="max-w-sm text-sm text-[var(--muted)]">
              Mientras todas estén apagadas no hay recursos asignados que mostrar.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="flex flex-col gap-4 px-3 py-5 sm:px-5">
              <div className="px-2 sm:px-1">
                <h3 className="text-base font-semibold tracking-tight">Por sistema operativo</h3>
                <p className="text-sm text-[var(--muted)]">
                  {metricMeta[metric].label} asignados a VMs encendidas de cada SO.
                </p>
              </div>
              <AllocatedResourcesChart byOs={aggregate.byOs} metric={metric} />
            </div>
            <div className="flex flex-col gap-4 border-t border-[var(--border)] px-5 py-5 sm:px-6 lg:border-l lg:border-t-0">
              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  {rankingTitle(top.length, metric)}
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  Asignación de cada VM; la barra compara con la primera.
                </p>
              </div>
              <TopVmsList items={top} metric={metric} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
