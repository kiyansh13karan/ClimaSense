'use client';

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Droplets, Wind, Thermometer, Activity } from 'lucide-react';
import type { ForecastEntry } from '@/lib/types';

interface HourlyForecastProps {
  forecast: ForecastEntry[];
}

type MetricKey = 'riskScore' | 'rainfall' | 'temperature' | 'windSpeed';

const metrics: Array<{
  key: MetricKey;
  label: string;
  Icon: React.ElementType;
  unit: string;
  color: string;
  gradId: string;
}> = [
  { key: 'riskScore',   label: 'Risk',        Icon: Activity,    unit: '%',    color: 'var(--color-primary)',   gradId: 'hRisk' },
  { key: 'rainfall',    label: 'Rainfall',    Icon: Droplets,    unit: 'mm/h', color: 'var(--color-accent)',    gradId: 'hRain' },
  { key: 'temperature', label: 'Temperature', Icon: Thermometer, unit: '°C',   color: 'var(--color-secondary)', gradId: 'hTemp' },
  { key: 'windSpeed',   label: 'Wind',        Icon: Wind,        unit: 'km/h', color: 'var(--color-chart-3)',   gradId: 'hWind' },
];

export const HourlyForecast = memo(function HourlyForecast({ forecast }: HourlyForecastProps) {
  const [active, setActive] = useState<MetricKey>('riskScore');
  const metric = metrics.find(m => m.key === active)!;

  const chartData = forecast.map(f => ({
    label: f.label,
    value: f[active],
  }));

  const maxVal = Math.max(...chartData.map(d => d.value));
  const peakLabel = chartData.find(d => d.value === maxVal)?.label;

  return (
    <div className="card-secondary shadow-premium">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-0 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-foreground">Hourly Forecast</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">Next 24 hours · Atmospheric signals</p>
        </div>

        {/* Metric selector */}
        <div className="flex gap-1.5 flex-wrap">
          {metrics.map(m => {
            const Icon = m.Icon;
            const isActive = active === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setActive(m.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                <Icon className="w-3 h-3" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="h-44 px-2 pt-5"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id={metric.gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={metric.color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
              strokeOpacity={0.4}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10, opacity: 0.5 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10, opacity: 0.5 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                fontSize: '12px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600, marginBottom: 4 }}
              formatter={(v: number) => [`${v}${metric.unit}`, metric.label]}
            />
            {peakLabel && (
              <ReferenceLine
                x={peakLabel}
                stroke={metric.color}
                strokeDasharray="4 3"
                strokeOpacity={0.35}
                label={{
                  value: 'Peak',
                  position: 'insideTopRight',
                  fontSize: 9,
                  fill: 'var(--color-muted-foreground)',
                  dy: -4,
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke={metric.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${metric.gradId})`}
              dot={false}
              activeDot={{ r: 3.5, fill: metric.color, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Hourly pills — temperature + rainfall quick view */}
      <div className="flex gap-2 px-6 pt-4 pb-5 overflow-x-auto scrollbar-hide">
        {forecast.slice(0, 10).map((f, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl bg-muted/25 border border-border/15 min-w-[54px] shrink-0 hover:border-border/35 transition-colors"
          >
            <span className="text-[10px] text-muted-foreground/70">{f.label}</span>
            <span className="text-sm font-bold text-foreground">{f.temperature}°</span>
            <span className="text-[10px] text-muted-foreground/70">{f.rainfall}mm</span>
          </div>
        ))}
      </div>
    </div>
  );
});
