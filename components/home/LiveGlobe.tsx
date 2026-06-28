'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import Globe to avoid SSR issues with WebGL/window
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export function LiveGlobe() {
  const [mounted, setMounted] = useState(false);
  const [arcsData, setArcsData] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);

    // Mock data for globe arcs (storm paths, wind patterns, etc)
    const N = 20;
    const arcs = [...Array(N).keys()].map(() => ({
      startLat: (Math.random() - 0.5) * 180,
      startLng: (Math.random() - 0.5) * 360,
      endLat: (Math.random() - 0.5) * 180,
      endLng: (Math.random() - 0.5) * 360,
      color: ['#3b82f6', '#ef4444', '#f97316'][Math.floor(Math.random() * 3)],
    }));
    setArcsData(arcs);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center opacity-30">
        <div className="w-[800px] h-[800px] rounded-full border border-primary/20 bg-primary/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center opacity-40 mix-blend-screen">
      <div className="translate-y-32 scale-150">
        <Globe
          height={800}
          width={800}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          arcsData={arcsData}
          arcColor="color"
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={2500}
          arcStroke={1}
          atmosphereColor="#3b82f6"
          atmosphereAltitude={0.2}
        />
      </div>
    </div>
  );
}
