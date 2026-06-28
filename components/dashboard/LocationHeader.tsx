'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, RefreshCw, WifiOff, FlaskConical, Clock, BellRing } from 'lucide-react';
import type { LocationInfo } from '@/lib/types';
import { AlertSubscriptionModal } from './AlertSubscriptionModal';
import { useState } from 'react';

interface LocationHeaderProps {
  location: LocationInfo;
  riskBadge: React.ReactNode;
  lastUpdated: Date | null;
  source: 'live' | 'mock' | 'cached' | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const LocationHeader = memo(function LocationHeader({
  location,
  riskBadge,
  lastUpdated,
  source,
  isRefreshing,
  onRefresh,
}: LocationHeaderProps) {
  const minutesAgo = lastUpdated
    ? Math.round((Date.now() - lastUpdated.getTime()) / 60000)
    : null;

  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  const isLive = source === 'live';
  const sourceLabel = source === 'live' ? 'Live' : source === 'cached' ? 'Cached' : 'Demo';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      {/* Meta row — source + time + location label */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-muted-foreground/70">
          <MapPin className="w-3 h-3" />
          <span className="text-xs tracking-wide">Monitoring Location</span>
        </div>

        <span className="text-border/40">·</span>

        {/* Source pill */}
        <div className={`pill ${
          isLive
            ? 'text-green-500 border-green-500/20 bg-green-500/8'
            : source === 'mock'
            ? 'text-blue-400 border-blue-500/20 bg-blue-500/8'
            : 'text-muted-foreground border-border/30'
        }`}>
          {isLive ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{sourceLabel}</>
          ) : source === 'mock' ? (
            <><FlaskConical className="w-3 h-3" />{sourceLabel}</>
          ) : (
            <><WifiOff className="w-3 h-3" />{sourceLabel}</>
          )}
        </div>

        {/* Time */}
        {minutesAgo !== null && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
            <Clock className="w-3 h-3" />
            <span>{minutesAgo === 0 ? 'Just updated' : `Updated ${minutesAgo}m ago`}</span>
          </div>
        )}
      </div>

      {/* City name row */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="space-y-2">
          <motion.h1
            key={location.city}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-none"
          >
            {location.city}
            {location.region && (
              <span className="text-muted-foreground/35 font-light">, {location.region}</span>
            )}
          </motion.h1>

          {/* Coordinates + local time */}
          <div className="flex items-center gap-3 flex-wrap">
            {location.lat !== 0 && (
              <span className="font-mono text-[11px] text-muted-foreground/35 tracking-wider">
                {location.lat.toFixed(3)}°{location.lat >= 0 ? 'N' : 'S'}{' '}
                {Math.abs(location.lng).toFixed(3)}°{location.lng < 0 ? 'W' : 'E'}
              </span>
            )}
            {location.localTime && (
              <>
                <span className="text-border/40">·</span>
                <span className="text-xs text-muted-foreground/70">
                  Local {location.localTime}
                </span>
              </>
            )}
            {location.country && (
              <>
                <span className="text-border/40">·</span>
                <span className="text-xs text-muted-foreground/70">{location.country}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: risk badge + refresh + subscribe */}
        <div className="flex items-center gap-3 mt-1 shrink-0">
          {riskBadge}
          <button
            onClick={() => setIsSubscribeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-lg"
            aria-label="Subscribe to alerts"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Alerts</span>
          </button>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-muted/40 transition-colors disabled:opacity-40 group"
            aria-label="Refresh data"
          >
            <RefreshCw
              className={`w-4 h-4 text-muted-foreground/70 group-hover:text-muted-foreground transition-colors ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
          </button>
        </div>
      </div>
      <AlertSubscriptionModal 
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        location={location}
      />
    </motion.div>
  );
});
