'use client';

import { memo } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { TrendDirection } from '@/lib/types';

interface WaterLevelChartProps {
  currentLevel: number;
  historicalAverage: number;
  chartData: Array<{ time: string; level: number; historical: number }>;
  trend: TrendDirection;
}

const trendMeta = {
  rising:  { Icon: TrendingUp,   color: 'text-destructive',      label: 'Rising',  bg: 'bg-destructive/10' },
  falling: { Icon: TrendingDown, color: 'text-green-500',        label: 'Falling', bg: 'bg-green-500/10' },
  stable:  { Icon: Minus,        color: 'text-muted-foreground', label: 'Stable',  bg: 'bg-muted/30' },
} as const;

export const WaterLevelChart = memo(function WaterLevelChart({
  currentLevel,
  historicalAverage,
  chartData,
  trend,
}: WaterLevelChartProps) {
  const { Icon, color, label, bg } = trendMeta[trend];
  const diff = Math.abs(currentLevel - historicalAverage).toFixed(2);
  const above = currentLevel > historicalAverage;

  return (
    <div className="card-secondary shadow-premium h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-0">
        <div>
          <p className="text-sm font-semibold text-foreground">Water Level Trend</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">Current vs historical average</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${bg}`}>
          <Icon className={`w-3.5 h-3.5 ${color}`} />
          <span className={color}>{label}</span>
        </div>
      </div>

      {/* Stat row — 3 compact metrics */}
      <div className="grid grid-cols-3 gap-3 px-6 pt-5">
        <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
          <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wide block mb-1">Current</span>
          <motion.span
            key={currentLevel}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl font-bold text-primary leading-none block"
          >
            {currentLevel.toFixed(1)}
          </motion.span>
          <span className="text-[10px] text-muted-foreground/70 mt-1 block">meters</span>
        </div>
        <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
          <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wide block mb-1">Historical</span>
          <span className="text-2xl font-bold text-muted-foreground/60 leading-none block">
            {historicalAverage.toFixed(1)}
          </span>
          <span className="text-[10px] text-muted-foreground/70 mt-1 block">meters</span>
        </div>
        <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
          <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wide block mb-1">Δ Diff</span>
          <span className={`text-2xl font-bold leading-none block ${above ? 'text-destructive' : 'text-green-500'}`}>
            {above ? '+' : '−'}{diff}
          </span>
          <span className="text-[10px] text-muted-foreground/70 mt-1 block">meters</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 px-4 pt-5 pb-4 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
              strokeOpacity={0.4}
            />
            <XAxis
              dataKey="time"
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
              formatter={(v: number, name: string) => [
                `${v.toFixed(2)}m`,
                name === 'level' ? 'Current' : 'Historical avg',
              ]}
            />
            <Line
              type="monotone"
              dataKey="level"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3.5, fill: 'var(--color-primary)', strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="historical"
              stroke="var(--color-muted-foreground)"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              strokeOpacity={0.4}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-6 pb-5 text-[11px] text-muted-foreground/70">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-primary rounded-full" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-muted-foreground/40 rounded-full" style={{ borderTop: '1.5px dashed' }} />
          <span>Historical</span>
        </div>
      </div>
    </div>
  );
});
