'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, Bell, BellOff, X, Wind, Droplets, Eye, Gauge } from 'lucide-react';
import type { Alert, AlertSeverity } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface AlertsPanelProps {
  alerts: Alert[];
}

const severityConfig: Record<AlertSeverity, {
  Icon: React.ElementType;
  bg: string;
  border: string;
  badge: string;
  text: string;
  dot: string;
}> = {
  critical: {
    Icon: AlertTriangle,
    bg: 'bg-destructive/6 dark:bg-destructive/8',
    border: 'border-destructive/20',
    badge: 'bg-destructive/12 text-destructive border-destructive/15',
    text: 'text-destructive',
    dot: 'bg-destructive',
  },
  warning: {
    Icon: AlertTriangle,
    bg: 'bg-orange-500/6 dark:bg-orange-500/8',
    border: 'border-orange-500/20',
    badge: 'bg-orange-500/12 text-orange-500 border-orange-500/15',
    text: 'text-orange-500',
    dot: 'bg-orange-500',
  },
  info: {
    Icon: Info,
    bg: 'bg-primary/4',
    border: 'border-primary/12',
    badge: 'bg-primary/8 text-primary border-primary/12',
    text: 'text-primary',
    dot: 'bg-primary',
  },
};

const categoryIcons: Record<Alert['category'], React.ElementType> = {
  flood: Droplets,
  wind: Wind,
  rain: Droplets,
  visibility: Eye,
  pressure: Gauge,
  general: Info,
};

const AlertCard = memo(function AlertCard({
  alert,
  onDismiss,
}: {
  alert: Alert;
  onDismiss: (id: string) => void;
}) {
  const cfg = severityConfig[alert.severity];
  const SeverityIcon = cfg.Icon;
  const CategoryIcon = categoryIcons[alert.category];

  const timeAgo = (() => {
    try { return formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true }); }
    catch { return 'recently'; }
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 12, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className={`relative p-4 rounded-xl border ${cfg.bg} ${cfg.border} group`}
    >
      <div className="flex items-start gap-3">
        {/* Severity icon */}
        <div className={`mt-0.5 shrink-0 ${cfg.text}`}>
          <SeverityIcon className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Title + badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground leading-tight">
              {alert.title}
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${cfg.badge}`}>
              {alert.severity}
            </span>
          </div>

          {/* Message */}
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            {alert.message}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <CategoryIcon className="w-3 h-3 text-muted-foreground/70" />
            <span className="text-[10px] text-muted-foreground/70 capitalize">{alert.category}</span>
            <span className="text-muted-foreground/25">·</span>
            <span className="text-[10px] text-muted-foreground/70">{timeAgo}</span>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => onDismiss(alert.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted/50 shrink-0 mt-0.5"
          aria-label="Dismiss alert"
        >
          <X className="w-3 h-3 text-muted-foreground/70" />
        </button>
      </div>

      {/* Critical pulse indicator */}
      {alert.severity === 'critical' && (
        <span className="absolute top-4 right-4 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-50" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
        </span>
      )}
    </motion.div>
  );
});

export const AlertsPanel = memo(function AlertsPanel({ alerts }: AlertsPanelProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState(false);

  const visible = alerts.filter(a => !dismissed.has(a.id));
  const criticalCount = visible.filter(a => a.severity === 'critical').length;
  const warningCount = visible.filter(a => a.severity === 'warning').length;

  return (
    <div className="card-primary shadow-premium h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/25">
        <div className="flex items-center gap-2.5">
          <Bell className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Active Alerts</span>
          {criticalCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground">
              {criticalCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {/* Summary counts */}
          {visible.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
              {criticalCount > 0 && <span className="text-destructive font-medium">{criticalCount} critical</span>}
              {criticalCount > 0 && warningCount > 0 && <span className="text-muted-foreground/30">·</span>}
              {warningCount > 0 && <span className="text-orange-500 font-medium">{warningCount} warning</span>}
            </div>
          )}
          <button
            onClick={() => setMuted(v => !v)}
            className="p-1.5 rounded-lg hover:bg-muted/40 transition-colors"
            aria-label={muted ? 'Unmute alerts' : 'Mute alerts'}
          >
            {muted
              ? <BellOff className="w-3.5 h-3.5 text-muted-foreground/70" />
              : <Bell className="w-3.5 h-3.5 text-muted-foreground/70" />
            }
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-6 py-4 overflow-y-auto scrollbar-hide">
        {visible.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-11 h-11 rounded-full bg-green-500/10 border border-green-500/15 flex items-center justify-center mb-3">
              <Bell className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-semibold text-foreground">All Clear</p>
            <p className="text-xs text-muted-foreground/70 mt-1.5 max-w-[180px] leading-relaxed">
              No active weather alerts for this location
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {/* Critical first */}
              {visible
                .sort((a, b) => {
                  const order = { critical: 0, warning: 1, info: 2 };
                  return order[a.severity] - order[b.severity];
                })
                .map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onDismiss={id => setDismissed(prev => new Set([...prev, id]))}
                  />
                ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
});
