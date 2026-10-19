'use client';

import { useMemo } from 'react';
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

import type { OsAllocation } from './lib/aggregate-resources';
import { formatCount } from './lib/format';
import { metricMeta, type Metric } from './metrics';

/** Barras horizontales por SO para una sola métrica (no se mezclan unidades en un eje). */
export function AllocatedResourcesChart({
  byOs,
  metric,
}: {
  byOs: OsAllocation[];
  metric: Metric;
}) {
  const meta = metricMeta[metric];

  const data = useMemo(
    () => byOs.map((row) => ({ os: row.os, value: row[metric] })).sort((a, b) => b.value - a.value),
    [byOs, metric],
  );

  return (
    <>
      <div className="h-60 w-full min-w-0" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 4, right: 40, top: 4, bottom: 4 }}
            barCategoryGap="28%"
          >
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              stroke="var(--border-strong)"
              tickLine={false}
              allowDecimals={false}
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              tickFormatter={(v: number) => formatCount(v)}
            />
            <YAxis
              type="category"
              dataKey="os"
              width={112}
              stroke="var(--border-strong)"
              tickLine={false}
              tick={{ fill: 'var(--text)', fontSize: 13 }}
            />
            <Tooltip
              cursor={{ fill: 'var(--accent-soft)' }}
              separator=""
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-pop)',
                color: 'var(--text)',
              }}
              labelStyle={{ color: 'var(--text)', fontWeight: 600 }}
              itemStyle={{ color: 'var(--muted)' }}
              formatter={(value) => [`${formatCount(Number(value))} ${meta.unit}`, '']}
            />
            <Bar
              dataKey="value"
              fill="var(--accent)"
              radius={[0, 6, 6, 0]}
              maxBarSize={28}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="value"
                position="right"
                formatter={(label) => formatCount(Number(label))}
                style={{ fill: 'var(--text)', fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>
          {meta.label} asignados por sistema operativo ({meta.unit})
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
    </>
  );
}
