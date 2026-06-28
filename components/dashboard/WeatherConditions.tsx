'use client';

import { memo } from 'react';
import { Droplets, Eye, Wind, Gauge, Thermometer, Sun, CloudRain, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';
import type { WeatherSignal } from '@/lib/types';

interface WeatherConditionsProps {
  weather: WeatherSignal;
}



function windDir(deg: number) {
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8];
}

function rainfallLabel(mm: number) {
  if (mm === 0) return 'None';
  if (mm < 2.5) return 'Light';
  if (mm < 7.5) return 'Moderate';
  return 'Heavy';
}

export const WeatherConditions = memo(function WeatherConditions({ weather }: WeatherConditionsProps) {

  const dir = windDir(weather.windDirection);

  /* Primary metrics — large display */
  const primary = [
    {
      Icon: Thermometer,
      label: 'Temperature',
      value: `${weather.temperature}°`,
      sub: `Feels ${weather.feelsLike}°C`,
      color: 'text-orange-400',
    },
    {
      Icon: Droplets,
      label: 'Humidity',
      value: `${weather.humidity}%`,
      sub: `Dew ${weather.dewPoint}°C`,
      color: 'text-blue-400',
    },
    {
      Icon: Wind,
      label: 'Wind',
      value: `${weather.windSpeed}`,
      unit: 'km/h',
      sub: dir,
      color: 'text-cyan-400',
    },
    {
      Icon: Gauge,
      label: 'Pressure',
      value: `${weather.pressure}`,
      unit: 'hPa',
      sub: weather.pressure < 1000 ? 'Low' : weather.pressure > 1020 ? 'High' : 'Normal',
      color: 'text-purple-400',
    },

  ];

  /* Secondary metrics — compact row */
  const secondary = [
    {
      Icon: CloudRain,
      label: 'Rainfall',
      value: `${weather.rainfall} mm/h`,
      sub: rainfallLabel(weather.rainfall),
    },
    {
      Icon: Eye,
      label: 'Visibility',
      value: `${weather.visibility} km`,
      sub: weather.visibility < 5 ? 'Poor' : weather.visibility < 10 ? 'Fair' : 'Good',
    },
    {
      Icon: Cloud,
      label: 'Cloud Cover',
      value: `${weather.cloudCover}%`,
      sub: weather.cloudCover < 25 ? 'Clear' : weather.cloudCover < 75 ? 'Partly' : 'Overcast',
    },
    {
      Icon: Sun,
      label: 'UV Index',
      value: `${weather.uvIndex}`,
      sub: weather.uvIndex <= 2 ? 'Low' : 
           weather.uvIndex <= 5 ? 'Moderate' : 
           weather.uvIndex <= 7 ? 'High' : 
           weather.uvIndex <= 10 ? 'Very High' : 'Extreme',
    },
  ];

  return (
    <div className="card-primary shadow-premium h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border/25">
        <div>
          <p className="text-sm font-semibold text-foreground">Current Conditions</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5 capitalize">{weather.description}</p>
        </div>
      </div>

      {/* Primary metrics — grid */}
      <div className="grid grid-cols-2 gap-3 px-5 pt-4">
        {primary.map(({ Icon, label, value, unit, sub, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="p-3.5 rounded-xl bg-muted/20 border border-border/20 hover:border-border/40 transition-colors"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
              <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground leading-none">{value}</span>
              {unit && <span className="text-xs text-muted-foreground/70">{unit}</span>}
            </div>
            <span className="text-[11px] text-muted-foreground/60 mt-1 block">{sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Secondary metrics — compact horizontal list */}
      <div className="px-5 pt-3 pb-5 mt-auto">
        <div className="grid grid-cols-2 gap-2">
          {secondary.map(({ Icon, label, value, sub }) => (
            <div key={label} className="stat-compact">
              <Icon className="w-3.5 h-3.5 text-primary/50 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground/70 truncate">{label}</p>
                <p className="text-xs font-semibold text-foreground leading-tight">{value}</p>
                <p className="text-[10px] text-muted-foreground/70">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
