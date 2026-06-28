'use client';

import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_ALERTS = [
  "CRITICAL: Flash Flood Warning in Houston, TX",
  "HIGH RISK: Severe Thunderstorm Watch for Miami, FL",
  "CAUTION: Elevated PM2.5 Levels in Seattle, WA",
  "WARNING: Gale Force Winds detected off the coast of New York",
];

export function EmergencyTicker() {
  return (
    <div className="w-full bg-destructive/10 border-b border-destructive/20 overflow-hidden py-1.5 flex items-center relative z-50">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
      
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 30,
        }}
        className="flex whitespace-nowrap items-center gap-12 px-4"
      >
        {[...MOCK_ALERTS, ...MOCK_ALERTS, ...MOCK_ALERTS].map((alert, i) => (
          <div key={i} className="flex items-center gap-2 text-xs font-semibold tracking-wide text-destructive">
            <AlertTriangle className="w-3.5 h-3.5" />
            {alert}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
