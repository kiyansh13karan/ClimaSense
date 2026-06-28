'use client';

import { memo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface ForecastTrendProps {
  data: Array<{ day: string; risk: number }>;
}

function riskColor(risk: number) {
  if (risk > 70) return '#ef4444';
  if (risk > 50) return '#f97316';
  if (risk > 30) return '#eab308';
  return '#22c55e';
}

export const ForecastTrend = memo(function ForecastTrend({ data }: ForecastTrendProps) {
  const peak = Math.max(...data.map(d => d.risk));
  const peakDay = data.find(d => d.risk === peak)?.day;
  const avg = Math.round(data.reduce((s, d) => s + d.risk, 0) / data.length);

  return (
    <div className="card-secondary shadow-premium">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-0 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-foreground">7-Day Flood Risk Forecast</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">Projected risk levels for the coming week</p>
        </div>
        {/* Summary stats */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">Peak</p>
            <p className="text-sm font-bold text-foreground">{peakDay} · {peak}%</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">Avg</p>
            <p className="text-sm font-bold text-muted-foreground/70">{avg}%</p>
          </div>
        </div>
      </div>

      {/* Day risk bars — visual quick-scan row */}
      <div className="flex gap-2 px-6 pt-5">
        {data.map((d) => {
          const color = riskColor(d.risk);
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-1 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${d.risk}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground/70">{d.day}</span>
              <span className="text-[10px] font-semibold" style={{ color }}>{d.risk}%</span>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="h-40 px-2 pt-4 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
              strokeOpacity={0.4}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10, opacity: 0.5 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10, opacity: 0.5 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
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
              formatter={(v: number) => [`${v}%`, 'Flood Risk']}
            />
            {/* Average reference line */}
            <ReferenceLine
              y={avg}
              stroke="var(--color-muted-foreground)"
              strokeDasharray="4 3"
              strokeOpacity={0.3}
              label={{
                value: `avg ${avg}%`,
                position: 'insideTopRight',
                fontSize: 9,
                fill: 'var(--color-muted-foreground)',
                opacity: 0.4,
              }}
            />
            <Area
              type="monotone"
              dataKey="risk"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#forecastGrad)"
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--color-primary)', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
