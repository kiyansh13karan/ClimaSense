'use client';

import { useState, useEffect, useRef, Suspense, memo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { LocationHeader } from '@/components/dashboard/LocationHeader';
import { RiskOverview } from '@/components/dashboard/RiskOverview';
import { WaterLevelChart } from '@/components/dashboard/WaterLevelChart';
import { WeatherConditions } from '@/components/dashboard/WeatherConditions';
import { AQIPanel } from '@/components/dashboard/AQIPanel';
import { ForecastTrend } from '@/components/dashboard/ForecastTrend';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import LeafletMapWrapper from '@/components/map/LeafletMapWrapper';
import { AtmosChat } from '@/components/chat/AtmosChat';
import { RiskFactorsPanel } from '@/components/dashboard/RiskFactorsPanel';
import { HourlyForecast } from '@/components/dashboard/HourlyForecast';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { useDashboard } from '@/hooks/use-dashboard';
import { useDemoMode } from '@/hooks/use-demo-mode';
import { useGeolocation } from '@/hooks/use-geolocation';
import { getRiskBgColor } from '@/lib/risk-engine';
import type { RiskLevel } from '@/lib/types';

/* ─── Animation config ─────────────────────────────────────── */
const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.44 } },
};

/* ─── Section wrapper ──────────────────────────────────────── */
function Section({ label, children, className = '' }: {
  label?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <motion.section variants={sectionVariants} className={className}>
      {label && (
        <div className="section-header">
          <span className="section-label">{label}</span>
          <div className="section-header-line" />
        </div>
      )}
      {children}
    </motion.section>
  );
}

/* ─── Risk badge ───────────────────────────────────────────── */
const RiskBadge = memo(function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase ${getRiskBgColor(level)}`}
    >
      {level} Risk
    </motion.span>
  );
});

/* ─── Geo permission banner ────────────────────────────────── */
function GeoBanner({ onRequest }: { onRequest: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mb-6 flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-primary/8 border border-primary/15"
    >
      <p className="text-sm text-foreground/80">
        <span className="font-semibold text-primary">Enable location</span>{' '}
        for precise local atmospheric intelligence.
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRequest}
          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          Allow
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Error state ──────────────────────────────────────────── */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-32 text-center space-y-5"
    >
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
        <span className="text-2xl">⚠️</span>
      </div>
      <div className="space-y-1.5">
        <p className="font-semibold text-foreground">Unable to load data</p>
        <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </motion.div>
  );
}

/* ─── Dashboard content ────────────────────────────────────── */
function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL param — this is the source of truth for manual searches
  const urlLocation = searchParams?.get('location') ?? '';

  const { isDemoMode, toggleDemoMode, hydrated } = useDemoMode();
  const geo = useGeolocation();

  // currentLocation drives the dashboard fetch.
  // Priority: geo coords (if granted) > URL param > IP fallback > default
  const [currentLocation, setCurrentLocation] = useState(urlLocation || 'Houston');
  const [isResolvingIpLocation, setIsResolvingIpLocation] = useState(!urlLocation);

  // Sync URL param changes into state (handles browser back/forward)
  const prevUrlLocation = useRef(urlLocation);
  useEffect(() => {
    if (urlLocation && urlLocation !== prevUrlLocation.current) {
      prevUrlLocation.current = urlLocation;
      // Only override if user isn't using geo
      if (geo.status !== 'granted') {
        setCurrentLocation(urlLocation);
      }
    }
  }, [urlLocation, geo.status]);

  // When geo resolves city name, switch to it
  useEffect(() => {
    if (geo.status === 'granted' && geo.city) {
      setCurrentLocation(geo.city);
      router.replace(
        `/dashboard?location=${encodeURIComponent(geo.city)}`,
        { scroll: false }
      );
    }
  }, [geo.status, geo.city, router]);

  // Auto-resolve IP location on initial load if no location is specified in URL
  useEffect(() => {
    if (!urlLocation) {
      let mounted = true;
      fetch('/api/ip-location')
        .then(res => {
          if (!res.ok) throw new Error('IP lookup failed');
          return res.json();
        })
        .then(data => {
          if (mounted && data.city) {
            setCurrentLocation(data.displayName || data.city);
          }
        })
        .catch(e => console.error('IP location failed:', e))
        .finally(() => {
          if (mounted) setIsResolvingIpLocation(false);
        });
      
      return () => { mounted = false; };
    }
  }, [urlLocation]);


  // Determine coords to pass — only when geo is granted
  const activeCoords = geo.status === 'granted' ? geo.coords : null;

  // Don't start fetching until demo mode is hydrated from localStorage and IP location is resolved
  const { data, isLoading: dashboardLoading, isRefreshing, error, source, lastUpdated, refresh } = useDashboard({
    location: isResolvingIpLocation ? '' : currentLocation,
    coords: activeCoords,
    demoMode: hydrated ? isDemoMode : false,
    autoRefreshMs: 5 * 60 * 1000,
  });

  const isLoading = dashboardLoading || isResolvingIpLocation;

  const handleLocationSearch = (location: string) => {
    geo.reset(); // clear geo state when user manually searches
    setCurrentLocation(location);
    router.push(`/dashboard?location=${encodeURIComponent(location)}`, { scroll: false });
  };

  const showGeoBanner = geo.status === 'idle';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Ambient top glow */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 h-[560px] pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 45% at 50% -8%, color-mix(in oklch, var(--primary) 9%, transparent), transparent)',
        }}
      />

      <Navbar
        onLocationSearch={handleLocationSearch}
        isDemoMode={isDemoMode}
        onToggleDemoMode={toggleDemoMode}
        geoStatus={geo.status}
        onRequestGeo={geo.request}
      />

      <main className="relative z-10 flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
        <AnimatePresence mode="wait">

          {/* Loading skeleton */}
          {isLoading && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {showGeoBanner && <GeoBanner onRequest={geo.request} />}
              <DashboardSkeleton />
            </motion.div>
          )}

          {/* Error state */}
          {!isLoading && error && !data && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ErrorState message={error} onRetry={refresh} />
            </motion.div>
          )}

          {/* Dashboard */}
          {!isLoading && data && (
            <motion.div
              key={`dash-${currentLocation}-${activeCoords?.lat ?? 0}`}
              variants={pageVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Geo banner */}
              <AnimatePresence>
                {showGeoBanner && (
                  <motion.div
                    key="geo-banner"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <GeoBanner onRequest={geo.request} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* HERO */}
              <Section className="pb-10">
                <LocationHeader
                  location={data.location}
                  riskBadge={<RiskBadge level={data.risk.level} />}
                  lastUpdated={lastUpdated}
                  source={source}
                  isRefreshing={isRefreshing}
                  onRefresh={refresh}
                />
              </Section>

              {/* RISK ASSESSMENT */}
              <Section label="Risk Assessment" className="section-divider">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6">
                  <div className="lg:col-span-3">
                    <RiskOverview
                      percentage={data.risk.percentage}
                      trend={data.risk.trend}
                      chartData={data.risk.weeklyForecast}
                    />
                  </div>
                  <div className="lg:col-span-2 flex flex-col gap-5 lg:gap-6">
                    <WeatherConditions weather={data.weather} />
                    <AQIPanel weather={data.weather} />
                  </div>
                </div>
              </Section>

              {/* AI INTELLIGENCE */}
              <Section label="AI Intelligence" className="section-divider">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6">
                  <div className="lg:col-span-3">
                    <AIInsights insights={data.aiInsights} riskLevel={data.risk.level} />
                  </div>
                  <div className="lg:col-span-2">
                    <AlertsPanel alerts={data.alerts ?? data.risk.alerts} />
                  </div>
                </div>
              </Section>

              {/* ANALYTICS */}
              <Section label="Analytics" className="section-divider">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                  <WaterLevelChart
                    currentLevel={parseFloat((data.weather.rainfall * 0.4 + 0.5).toFixed(2))}
                    historicalAverage={parseFloat((data.weather.rainfall * 0.26 + 0.5).toFixed(2))}
                    chartData={data.risk.trendHistory}
                    trend={data.risk.trend}
                  />
                  <RiskFactorsPanel factors={data.risk.factors} />
                </div>
              </Section>

              {/* FORECAST */}
              <Section label="Forecast" className="section-divider">
                <div className="space-y-5 lg:space-y-6">
                  <HourlyForecast forecast={data.forecast} />
                  <ForecastTrend data={data.risk.weeklyForecast} />
                </div>
              </Section>

              {/* MAP */}
              <Section label="Risk Intelligence Map" className="section-divider">
                <LeafletMapWrapper
                  mapData={data.mapData}
                  riskLevel={data.risk.level}
                  weather={data.weather}
                />
              </Section>

              {/* FOOTER */}
              <motion.footer
                variants={sectionVariants}
                className="pt-12 mt-4 border-t border-border/20"
              >
                <p className="text-xs text-muted-foreground/40 leading-relaxed max-w-2xl">
                  <span className="font-medium text-muted-foreground/60">Data Notice —</span>{' '}
                  {isDemoMode
                    ? 'Running in Demo Mode with simulated atmospheric data. Toggle to Live for real API data.'
                    : 'Live data from OpenWeather & Tomorrow.io. AI insights by Llama 3.3 70B via Groq.'}{' '}
                  Always follow official meteorological guidance and local emergency authorities.
                </p>
              </motion.footer>
            </motion.div>
          )}

        </AnimatePresence>
        {!isLoading && data && <AtmosChat data={data} />}
      </main>
    </div>
  );
}

/* ─── Page export ──────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col">
          <div className="h-[57px] border-b border-border/40 bg-background/80" />
          <main className="flex-1 max-w-screen-xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10">
            <DashboardSkeleton />
          </main>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
