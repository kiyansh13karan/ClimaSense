'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

interface RiskOverviewProps {
  percentage: number;
  trend: 'rising' | 'stable' | 'falling';
  chartData: Array<{ day: string; risk: number }>;
}

function getRiskMeta(pct: number) {
  if (pct > 70) return { bar: 'bg-destructive', ring: 'border-destructive/25', label: 'Critical', textColor: 'text-destructive', gradColor: 'var(--color-destructive)' };
  if (pct > 50) return { bar: 'bg-orange-500',  ring: 'border-orange-500/25',  label: 'High',     textColor: 'text-orange-500',  gradColor: '#f97316' };
  if (pct > 30) return { bar: 'bg-yellow-500',  ring: 'border-yellow-500/25',  label: 'Moderate', textColor: 'text-yellow-500',  gradColor: '#eab308' };
  return           { bar: 'bg-green-500',   ring: 'border-green-500/25',   label: 'Low',      textColor: 'text-green-500',   gradColor: '#22c55e' };
}

const trendConfig = {
  rising:  { Icon: TrendingUp,   color: 'text-destructive',      label: 'Rising',  bg: 'bg-destructive/10' },
  falling: { Icon: TrendingDown, color: 'text-green-500',        label: 'Falling', bg: 'bg-green-500/10' },
  stable:  { Icon: Minus,        color: 'text-muted-foreground', label: 'Stable',  bg: 'bg-muted/30' },
} as const;

export const RiskOverview = memo(function RiskOverview({
  percentage,
  trend,
  chartData,
}: RiskOverviewProps) {
  const meta = getRiskMeta(percentage);
  const { Icon: TrendIcon, color: trendColor, label: trendLabel, bg: trendBg } = trendConfig[trend];

  return (
    <div className={`card-primary shadow-premium overflow-hidden h-full border ${meta.ring}`}>

      {/* Top accent line */}
      <div className={`h-0.5 w-full ${meta.bar} opacity-60`} />

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-0">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-sm font-semibold text-foreground">Flood Risk Assessment</span>
        </div>
        <span className="text-[11px] text-muted-foreground/70 font-mono">Real-time</span>
      </div>

      {/* Main content */}
      <div className="px-6 pt-5 pb-6">

        {/* Score row */}
        <div className="flex items-end justify-between mb-5">
          {/* Big percentage */}
          <div>
            <motion.div
              key={percentage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-end gap-1.5 leading-none"
            >
              <span className="text-[5.5rem] font-bold tracking-tight text-foreground leading-none">
                {percentage}
              </span>
              <span className="text-3xl font-semibold text-muted-foreground/70 mb-3">%</span>
            </motion.div>
            <p className="text-xs text-muted-foreground/70 mt-1">Flood probability score</p>
          </div>

          {/* Status chips — stacked right */}
          <div className="flex flex-col gap-2.5 pb-2">
            {/* Trend chip */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${trendBg}`}>
              <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
              <span className={`text-xs font-semibold ${trendColor}`}>{trendLabel}</span>
            </div>
            {/* Level chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30">
              <span className={`w-2 h-2 rounded-full ${meta.bar}`} />
              <span className={`text-xs font-semibold ${meta.textColor}`}>{meta.label}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-1.5">
          <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full ${meta.bar}`}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground/30 font-mono">
            <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
          </div>
        </div>

        {/* Sparkline — 7-day trend */}
        <div className="mt-5">
          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest mb-2">7-Day Trend</p>
          <div className="h-20 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="riskSparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={meta.gradColor} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={meta.gradColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 9, opacity: 0.4 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    padding: '6px 10px',
                  }}
                  labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
                  formatter={(v: number) => [`${v}%`, 'Risk']}
                />
                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke={meta.gradColor}
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#riskSparkGrad)"
                  isAnimationActive={false}
                  dot={false}
                  activeDot={{ r: 3, fill: meta.gradColor, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
});
