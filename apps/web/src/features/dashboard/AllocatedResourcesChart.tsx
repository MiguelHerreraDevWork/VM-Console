'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { SegmentedControl } from '../../components/ui/SegmentedControl';
import type { OsAllocation } from './lib/aggregate-resources';
import { formatCount } from './lib/format';

type Metric = 'cores' | 'ramGb' | 'diskGb';

const metricMeta: Record<
  Metric,
  { label: string; unit: string; barFill: string }
> = {
  cores: { label: 'vCPU', unit: 'vCPU', barFill: 'var(--accent)' },
  ramGb: { label: 'RAM', unit: 'GB RAM', barFill: 'var(--accent-2)' },
  diskGb: { label: 'Disco', unit: 'GB disco', barFill: 'var(--success)' },
};

export function AllocatedResourcesChart({ byOs }: { byOs: OsAllocation[] }) {
  const [metric, setMetric] = useState<Metric>('cores');
  const meta = metricMeta[metric];

  const data = useMemo(
    () =>
      [...byOs]
        .map((row) => ({
          os: row.os,
          value: row[metric],
        }))
        .sort((a, b) => b.value - a.value),
    [byOs, metric],
  );

  return (
    <section
      aria-labelledby="chart-title"
      className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 id="chart-title" className="text-lg font-semibold tracking-tight">
            Recursos por sistema operativo
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Solo VMs encendidas. Una métrica a la vez; no se mezclan unidades.
          </p>
        </div>
        <SegmentedControl
          label="Métrica del gráfico"
          value={metric}
          onChange={setMetric}
          options={[
            { value: 'cores', label: 'vCPU' },
            { value: 'ramGb', label: 'RAM' },
            { value: 'diskGb', label: 'Disco' },
          ]}
        />
      </div>

      <div className="h-64 w-full min-w-0" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 28, top: 4, bottom: 4 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              stroke="var(--muted)"
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              tickFormatter={(v: number) => formatCount(v)}
            />
            <YAxis
              type="category"
              dataKey="os"
              width={110}
              stroke="var(--muted)"
              tick={{ fill: 'var(--text)', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text)',
              }}
              formatter={(value) => [
                `${formatCount(Number(value))} ${meta.unit}`,
                meta.label,
              ]}
            />
            <Bar dataKey="value" fill={meta.barFill} radius={[0, 6, 6, 0]} maxBarSize={28}>
              <LabelList
                dataKey="value"
                position="right"
                formatter={(label) => formatCount(Number(label))}
                style={{ fill: 'var(--muted)', fontSize: 11 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>
          {meta.label} asignados por SO ({meta.unit})
        </caption>
        <thead>
          <tr>
            <th scope="col">Sistema operativo</th>
            <th scope="col">{meta.unit}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.os}>
              <th scope="row">{row.os}</th>
              <td>
                {formatCount(row.value)} {meta.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
