'use client';

import { motion } from 'framer-motion';
import { Wind, Sun, Activity, Droplets } from 'lucide-react';
import type { WeatherSignal } from '@/lib/types';

export function AQIPanel({ weather }: { weather: WeatherSignal }) {
  const getAQILabel = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', color: 'text-green-400', bg: 'bg-green-400/20', border: 'border-green-400/30' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400/30' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-400', bg: 'bg-orange-400/20', border: 'border-orange-400/30' };
    if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-400', bg: 'bg-red-400/20', border: 'border-red-400/30' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'border-purple-400/30' };
    return { label: 'Hazardous', color: 'text-rose-600', bg: 'bg-rose-600/20', border: 'border-rose-600/30' };
  };

  const getUVLabel = (uv: number) => {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  };

  const aqiInfo = getAQILabel(weather.aqi || 45); // fallback to 45 if undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/40 backdrop-blur-md border border-border/40 rounded-2xl p-5 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
          <Wind className="w-4 h-4 text-primary" />
          Air Quality & Health
        </h3>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${aqiInfo.bg} ${aqiInfo.color} ${aqiInfo.border}`}>
          {aqiInfo.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">AQI Score</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">{weather.aqi || 45}</span>
            <span className="text-xs text-muted-foreground">US AQI</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">PM2.5</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">{weather.pm25 || 12.5}</span>
            <span className="text-xs text-muted-foreground">µg/m³</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-border/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <Sun className="w-4 h-4 text-yellow-500" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">UV Index</p>
            <p className="text-xs font-semibold text-foreground">
              {weather.uvIndex} <span className="font-normal text-muted-foreground">({getUVLabel(weather.uvIndex)})</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Dew Point</p>
            <p className="text-xs font-semibold text-foreground">{weather.dewPoint}°C</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
