'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat'; // Will be injected globally
import { buildDensityGrid } from '@/lib/weather/buildDensityGrid';
import { Droplets, Activity, Wind, AlertTriangle, Thermometer, PlusCircle, Navigation, ShieldCheck, Clock } from 'lucide-react';
import type { MapData, RiskLevel, WeatherSignal } from '@/lib/types';
import { IncidentReporter } from './IncidentReporter';
import { useMapEvents, Polyline, Marker, Popup } from 'react-leaflet';

// Fix leaflet default icon issue in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// ─── Heatmap Layer Component ─────────────────────────────────
function HeatmapLayer({ points, options }: { points: Array<[number, number, number]>, options: any }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    // @ts-ignore
    const heatLayer = L.heatLayer(points, options).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null;
}

// ─── Map Center Updater ──────────────────────────────────────
function MapUpdater({ center, zoom }: { center: { lat: number, lng: number }, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], zoom, {
      duration: 1.5,
      easeLinearity: 0.25
    });
  }, [center.lat, center.lng, zoom, map]);
  return null;
}

// ─── Markers Layer ───────────────────────────────────────────
function MarkersLayer({ markers }: { markers: any[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    const markerInstances: L.Marker[] = [];

    markers.forEach(m => {
      // Create a premium custom HTML marker
      const el = document.createElement('div');
      el.className = 'w-3 h-3 rounded-full border-2 border-white/80 shadow-[0_0_12px_rgba(255,255,255,0.4)] cursor-pointer transition-transform hover:scale-125';
      el.style.backgroundColor = m.severity === 'critical' ? '#ef4444' : 
                                 m.severity === 'high' ? '#f97316' : 
                                 m.severity === 'moderate' ? '#eab308' : '#3b82f6';
      
      const icon = L.divIcon({
        html: el,
        className: 'custom-leaflet-marker',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div class="bg-[#1a1f2e] border border-white/10 rounded-lg p-3 min-w-[150px] shadow-2xl">
          <p class="text-sm font-bold text-[#e8eaf0] mb-1">${m.label}</p>
          <p class="text-xs text-slate-400 capitalize">${m.type.replace('-', ' ')}</p>
        </div>
      `, {
        className: 'premium-popup'
      });
      markerInstances.push(marker);
    });

    return () => {
      markerInstances.forEach(m => map.removeLayer(m));
    };
  }, [map, markers]);

  return null;
}

// ─── Live Incidents Layer ─────────────────────────────────────
function LiveIncidentsLayer({ incidents }: { incidents: any[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !incidents || incidents.length === 0) return;
    const markerInstances: L.Marker[] = [];

    incidents.forEach(inc => {
      const el = document.createElement('div');
      el.className = 'w-4 h-4 rounded-full border-2 border-white/80 shadow-[0_0_15px_rgba(255,0,0,0.6)] cursor-pointer transition-transform hover:scale-125 animate-pulse';
      el.style.backgroundColor = inc.severity === 'critical' ? '#ef4444' : 
                                 inc.severity === 'high' ? '#f97316' : 
                                 inc.severity === 'medium' ? '#eab308' : '#3b82f6';
      
      const icon = L.divIcon({
        html: el,
        className: 'custom-leaflet-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon }).addTo(map);
      marker.bindPopup(`
        <div class="bg-[#1a1f2e] border border-red-500/30 rounded-lg p-3 min-w-[180px] shadow-2xl">
          <p class="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Live Report</p>
          <p class="text-sm font-bold text-[#e8eaf0] mb-1 capitalize">${inc.type.replace('_', ' ')}</p>
          <p class="text-xs text-slate-400 mb-2">${inc.description || 'No description provided.'}</p>
          <p class="text-[10px] text-slate-500">${new Date(inc.created_at).toLocaleString()}</p>
        </div>
      `, { className: 'premium-popup' });
      markerInstances.push(marker);
    });

    return () => {
      markerInstances.forEach(m => map.removeLayer(m));
    };
  }, [map, incidents]);

  return null;
}

// ─── Interaction Layer for Reporting ─────────────────────────
function IncidentInteractionLayer({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    contextmenu(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// ─── Evacuation Route Layer ──────────────────────────────────
function EvacuationRouteLayer({ routeInfo }: { routeInfo: any }) {
  const map = useMap();
  
  useEffect(() => {
    if (routeInfo && routeInfo.route.length > 0) {
      // Fit bounds to route
      const bounds = L.latLngBounds(routeInfo.route);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, routeInfo]);

  if (!routeInfo) return null;

  const destIcon = L.divIcon({
    html: `<div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-bounce"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>`,
    className: 'custom-dest-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });

  return (
    <>
      <Polyline 
        positions={routeInfo.route} 
        pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.8, dashArray: '10, 10', lineCap: 'round', className: 'animate-pulse' }} 
      />
      <Polyline 
        positions={routeInfo.route} 
        pathOptions={{ color: '#60a5fa', weight: 2, opacity: 1 }} 
      />
      <Marker position={[routeInfo.safeZone.lat, routeInfo.safeZone.lng]} icon={destIcon}>
        <Popup className="premium-popup">
          <div className="bg-[#1a1f2e] border border-green-500/30 rounded-lg p-3 min-w-[150px] shadow-2xl">
            <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">Safe Shelter</p>
            <p className="text-sm font-bold text-[#e8eaf0] mb-1">Evacuation Point</p>
            <div className="flex justify-between text-xs text-slate-400 mt-2 border-t border-white/10 pt-2">
              <span>{routeInfo.distance}</span>
              <span>{routeInfo.duration}</span>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
}

interface LeafletHeatMapProps {
  mapData: MapData;
  riskLevel: RiskLevel;
  weather?: WeatherSignal;
}

// ─── Main Component ──────────────────────────────────────────
export default function LeafletHeatMap({ mapData, riskLevel, weather }: LeafletHeatMapProps) {
  const [activeLayer, setActiveLayer] = useState<'rainfall' | 'flood' | 'heat' | 'composite'>('composite');
  const [radius, setRadius] = useState(25);
  const [opacity, setOpacity] = useState(0.8);
  const [threshold, setThreshold] = useState(0.05);
  const [mapZoom, setMapZoom] = useState(mapData.zoom || 11);
  const [reportCoords, setReportCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isReportMode, setIsReportMode] = useState(false);
  const [liveIncidents, setLiveIncidents] = useState<any[]>([]);
  const [evacRoute, setEvacRoute] = useState<any>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0); // in hours from now

  // Fetch live incidents
  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        setLiveIncidents(data);
      }
    } catch (e) {
      console.error('Failed to fetch incidents', e);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Handle reporting mode map click
  const handleMapClick = (lat: number, lng: number) => {
    if (isReportMode) {
      setReportCoords({ lat, lng });
      setIsReportMode(false); // turn off mode once dropped
    }
  };

  // Find Safe Route
  const handleEvacuate = async () => {
    if (evacRoute) {
      setEvacRoute(null); // toggle off
      return;
    }
    
    setIsRouting(true);
    try {
      // Use map center as the starting point for evacuation
      const res = await fetch('/api/evacuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startLat: mapData.center.lat,
          startLng: mapData.center.lng
        })
      });
      if (res.ok) {
        const data = await res.json();
        setEvacRoute(data);
      }
    } catch (e) {
      console.error('Routing failed', e);
    } finally {
      setIsRouting(false);
    }
  };

  // Generate density grid memoized
  const heatPoints = useMemo(() => {
    // If timeOffset > 0, we'll pretend the weather is worse/better to simulate forecast
    // In a real app we'd pass the actual forecast data here. 
    // Here we use timeOffset to dynamically shift the risk grid.
    const modifiedWeather = { ...weather } as any;
    if (modifiedWeather && modifiedWeather.rainfall !== undefined) {
       modifiedWeather.rainfall = modifiedWeather.rainfall * (1 + timeOffset * 0.1);
    }
    return buildDensityGrid(mapData.center, modifiedWeather, activeLayer, 15, mapZoom);
  }, [mapData.center, weather, activeLayer, mapZoom, timeOffset]);

  // Filter points based on threshold
  const filteredPoints = useMemo(() => {
    return heatPoints.filter(p => p[2] >= threshold);
  }, [heatPoints, threshold]);

  const heatOptions = useMemo(() => ({
    radius: radius,
    blur: radius * 1.2,
    maxZoom: 14,
    max: 1.0,
    minOpacity: opacity * 0.2,
    gradient: {
      0.1: '#3b82f6', // LIGHT -> Blue
      0.3: '#22c55e', // MEDIUM -> Green
      0.5: '#eab308', // ELEVATED -> Yellow
      0.7: '#f97316', // HIGH -> Orange
      0.9: '#ef4444', // DENSE -> Red
      1.0: '#991b1b'  // EXTREME -> Deep Red
    }
  }), [radius, opacity]);

  const layerOptions = [
    { id: 'composite', label: 'Composite', icon: Activity },
    { id: 'rainfall', label: 'Rainfall', icon: Droplets },
    { id: 'flood', label: 'Flood Risk', icon: AlertTriangle },
    { id: 'heat', label: 'Heat Stress', icon: Thermometer },
  ] as const;

  return (
    <div className="relative w-full h-[420px] lg:h-[480px] rounded-xl overflow-hidden border border-white/5 shadow-premium-lg group">
      
      {/* Map Container */}
      <MapContainer 
        center={[mapData.center.lat, mapData.center.lng]} 
        zoom={mapZoom} 
        className="w-full h-full z-0"
        zoomControl={false}
        // @ts-ignore
        whenReady={(mapInstance: any) => {
          mapInstance.target.on('zoomend', (e: any) => setMapZoom(e.target.getZoom()));
        }}
      >
        <TileLayer
          url="https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <MapUpdater center={mapData.center} zoom={mapData.zoom || 11} />
        <HeatmapLayer points={filteredPoints} options={heatOptions} />
        <MarkersLayer markers={mapData.markers} />
        <LiveIncidentsLayer incidents={liveIncidents} />
        <EvacuationRouteLayer routeInfo={evacRoute} />
        <IncidentInteractionLayer onMapClick={handleMapClick} />
      </MapContainer>

      {/* Layer Selector */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        <div className="glass-sm rounded-xl p-2 flex flex-col gap-1 backdrop-blur-md bg-black/40 border border-white/10">
          {layerOptions.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveLayer(id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeLayer === id 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
        
        {/* Report Incident Toggle */}
        <div className="mt-2 flex flex-col gap-2">
          <button
            onClick={() => setIsReportMode(!isReportMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              isReportMode 
                ? 'bg-red-500 text-white animate-pulse border border-red-400' 
                : 'bg-black/60 text-white/80 hover:bg-black/80 border border-white/10 backdrop-blur-md'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {isReportMode ? 'Click Map to Drop Pin' : 'Report Incident'}
          </button>
          
          <button
            onClick={handleEvacuate}
            disabled={isRouting}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              evacRoute 
                ? 'bg-green-600 text-white border border-green-500' 
                : 'bg-blue-600/90 hover:bg-blue-500 text-white border border-blue-500/50'
            }`}
          >
            {isRouting ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : evacRoute ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {isRouting ? 'Finding Route...' : evacRoute ? 'Clear Safe Route' : 'Find Safe Route'}
          </button>
        </div>
      </div>

      {/* Incident Reporter Overlay */}
      <IncidentReporter 
        coords={reportCoords} 
        onCancel={() => setReportCoords(null)} 
        onSuccess={(newIncident) => {
          setLiveIncidents([newIncident, ...liveIncidents]);
          setReportCoords(null);
        }} 
      />



      {/* Premium Legend System */}
      <div className="absolute bottom-4 left-4 z-[400]">
        <div className="glass-sm rounded-xl p-3 backdrop-blur-md bg-black/70 border border-white/10 shadow-xl mb-4">
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-2 border-b border-white/10 pb-1.5">
            Atmospheric Density
          </p>
          <div className="flex flex-col gap-1.5">
            {[
              { color: '#3b82f6', label: 'LIGHT' },
              { color: '#22c55e', label: 'MEDIUM' },
              { color: '#eab308', label: 'ELEVATED' },
              { color: '#f97316', label: 'HIGH' },
              { color: '#ef4444', label: 'DENSE' },
              { color: '#991b1b', label: 'EXTREME' }
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: color }} />
                <span className="text-[10px] font-medium text-white/70 tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time-Travel Forecast Slider */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] w-64 lg:w-80">
        <div className="glass-sm rounded-xl p-3 backdrop-blur-md bg-black/70 border border-white/10 shadow-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-white/80 font-medium">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary"/> Time-Travel</span>
            <span>{timeOffset === 0 ? 'Live Now' : `+${timeOffset} Hours`}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="24" 
            step="1"
            value={timeOffset}
            onChange={(e) => setTimeOffset(parseInt(e.target.value))}
            className="w-full accent-primary bg-white/20 rounded-full h-1.5 appearance-none outline-none"
          />
          <div className="flex justify-between text-[9px] text-white/50 uppercase tracking-wider font-bold">
            <span>Now</span>
            <span>+12h</span>
            <span>+24h</span>
          </div>
        </div>
      </div>

      {/* CSS overrides for Leaflet popups */}
      <style dangerouslySetInnerHTML={{__html: `
        .premium-popup .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        .premium-popup .leaflet-popup-tip {
          display: none;
        }
        .premium-popup .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-container {
          background: #0a0f1a;
          font-family: inherit;
        }
        .leaflet-control-attribution {
          background: rgba(0,0,0,0.4) !important;
          color: rgba(255,255,255,0.4) !important;
          border-top-left-radius: 4px;
        }
        .leaflet-control-attribution a {
          color: rgba(255,255,255,0.6) !important;
        }
        /* Custom markers don't need leaflet's default styling */
        .custom-leaflet-marker {
          background: none;
          border: none;
        }
      `}} />
    </div>
  );
}
