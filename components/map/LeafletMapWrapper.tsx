'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import type { MapData, RiskLevel, WeatherSignal } from '@/lib/types';

const DynamicLeafletHeatMap = dynamic(() => import('./LeafletHeatMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] lg:h-[480px] flex items-center justify-center bg-[#0a0f1a] rounded-xl border border-white/10 shadow-premium-lg">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-white/60 font-medium tracking-wide animate-pulse">Initializing Atmospheric Map...</p>
      </div>
    </div>
  )
});

interface LeafletMapWrapperProps {
  mapData: MapData;
  riskLevel: RiskLevel;
  weather?: WeatherSignal;
}

export default function LeafletMapWrapper(props: LeafletMapWrapperProps) {
  return <DynamicLeafletHeatMap {...props} />;
}
