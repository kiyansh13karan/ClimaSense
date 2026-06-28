'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import type { RiskFactors } from '@/lib/types';

interface RiskFactorsPanelProps {
  factors: RiskFactors;
}

const factorConfig = [
  { key: 'rainfallScore',   label: 'Rainfall Intensity',   weight: 35, icon: '🌧' },
  { key: 'pressureScore',   label: 'Pressure Drop',        weight: 20, icon: '🌀' },
  { key: 'humidityScore',   label: 'Humidity Level',       weight: 15, icon: '💧' },
  { key: 'windScore',       label: 'Wind Speed',           weight: 15, icon: '💨' },
  { key: 'trendEscalation', label: 'Trend Escalation',     weight: 10, icon: '📈' },
  { key: 'visibilityScore', label: 'Visibility Reduction', weight: 5,  icon: '👁' },
] as const;

function barColor(score: number) {
  if (score >= 75) return 'bg-destructive';
  if (score >= 55) return 'bg-orange-500';
  if (score >= 35) return 'bg-yellow-500';
  return 'bg-green-500';
}

function scoreMeta(score: number) {
  if (score >= 75) return { text: 'Critical', cls: 'text-destructive' };
  if (score >= 55) return { text: 'High',     cls: 'text-orange-500' };
  if (score >= 35) return { text: 'Moderate', cls: 'text-yellow-500' };
  return { text: 'Low', cls: 'text-green-500' };
}

export const RiskFactorsPanel = memo(function RiskFactorsPanel({ factors }: RiskFactorsPanelProps) {
  /* Composite weighted score */
  const composite = Math.round(
    factorConfig.reduce((acc, f) => acc + (factors[f.key] * f.weight) / 100, 0)
  );
  const compositeMeta = scoreMeta(composite);

  return (
    <div className="card-secondary shadow-premium h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/25">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Risk Factor Breakdown</span>
        </div>
        {/* Composite score */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground/70">Composite</span>
          <span className={`text-sm font-bold tabular-nums ${compositeMeta.cls}`}>{composite}</span>
        </div>
      </div>

      {/* Factors list */}
      <div className="flex-1 px-6 py-5 space-y-4">
        {factorConfig.map(({ key, label, weight, icon }, i) => {
          const score = factors[key];
          const { text, cls } = scoreMeta(score);

          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm leading-none" aria-hidden>{icon}</span>
                  <span className="text-xs font-medium text-foreground/80">{label}</span>
                  <span className="text-[10px] text-muted-foreground/35 font-mono">{weight}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold ${cls}`}>{text}</span>
                  <span className="text-xs font-bold text-foreground tabular-nums w-6 text-right">
                    {score}
                  </span>
                </div>
              </div>

              {/* Track */}
              <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.07 }}
                  className={`h-full rounded-full ${barColor(score)}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 pb-5">
        <p className="text-[10px] text-muted-foreground/35 leading-relaxed">
          Weighted composite from 6 atmospheric signals. Higher weight = greater flood impact.
        </p>
      </div>
    </div>
  );
});
