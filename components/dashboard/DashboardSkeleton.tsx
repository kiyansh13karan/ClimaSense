'use client';

import { Skeleton } from '@/components/ui/skeleton';

function SkeletonCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`card-primary shadow-premium ${className}`}>
      {children}
    </div>
  );
}

/* ─── Section label ────────────────────────────────────────── */
function SectionLabelSkeleton() {
  return (
    <div className="flex items-center gap-3 mb-7">
      <Skeleton className="w-20 h-2.5 rounded-full" />
      <Skeleton className="flex-1 h-px rounded-full opacity-30" />
    </div>
  );
}

/* ─── Hero ─────────────────────────────────────────────────── */
function HeroSkeleton() {
  return (
    <div className="space-y-5 pb-10">
      <div className="flex items-center gap-3">
        <Skeleton className="w-32 h-3.5 rounded-full" />
        <Skeleton className="w-16 h-5 rounded-full" />
        <Skeleton className="w-24 h-3.5 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-80 h-16 rounded-xl" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-36 h-3" />
          <Skeleton className="w-24 h-3" />
        </div>
      </div>
    </div>
  );
}

/* ─── Risk overview ────────────────────────────────────────── */
function RiskSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6">
      {/* Risk panel */}
      <SkeletonCard className="lg:col-span-3 p-6 space-y-5">
        <div className="flex justify-between">
          <Skeleton className="w-44 h-4" />
          <Skeleton className="w-20 h-3" />
        </div>
        <div className="flex items-end justify-between">
          <Skeleton className="w-36 h-20 rounded-xl" />
          <div className="space-y-2.5 pb-2">
            <Skeleton className="w-24 h-7 rounded-lg" />
            <Skeleton className="w-24 h-7 rounded-lg" />
          </div>
        </div>
        <Skeleton className="w-full h-1.5 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="w-20 h-2.5" />
          <Skeleton className="w-full h-20 rounded-lg" />
        </div>
      </SkeletonCard>

      {/* Weather conditions */}
      <SkeletonCard className="lg:col-span-2 p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="w-36 h-4" />
          <Skeleton className="w-20 h-4" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-muted/20 space-y-2">
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-14 h-7" />
              <Skeleton className="w-10 h-2.5" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/15">
              <Skeleton className="w-3.5 h-3.5 rounded" />
              <div className="space-y-1">
                <Skeleton className="w-12 h-2.5" />
                <Skeleton className="w-16 h-3" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}

/* ─── AI + Alerts ──────────────────────────────────────────── */
function IntelligenceSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6">
      {/* AI panel */}
      <SkeletonCard className="lg:col-span-3 p-6 space-y-5">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="w-40 h-4" />
              <Skeleton className="w-28 h-3" />
            </div>
          </div>
          <Skeleton className="w-14 h-6 rounded-full" />
        </div>
        <Skeleton className="w-full h-16 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="w-full h-3.5" />
          <Skeleton className="w-5/6 h-3.5" />
          <Skeleton className="w-4/6 h-3.5" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-5 h-5 rounded-full shrink-0" />
              <Skeleton className="flex-1 h-3.5" />
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* Alerts panel */}
      <SkeletonCard className="lg:col-span-2 p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-16 h-3" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-xl bg-muted/15 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="w-3.5 h-3.5 rounded mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="w-32 h-3.5" />
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-3/4 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}

/* ─── Analytics ────────────────────────────────────────────── */
function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
      {/* Water level */}
      <SkeletonCard className="p-6 space-y-5">
        <div className="flex justify-between">
          <Skeleton className="w-36 h-4" />
          <Skeleton className="w-20 h-7 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(j => (
            <div key={j} className="p-3 rounded-xl bg-muted/20 space-y-2">
              <Skeleton className="w-14 h-2.5" />
              <Skeleton className="w-12 h-7" />
              <Skeleton className="w-10 h-2.5" />
            </div>
          ))}
        </div>
        <Skeleton className="w-full h-40 rounded-lg" />
      </SkeletonCard>

      {/* Risk factors */}
      <SkeletonCard className="p-6 space-y-5">
        <div className="flex justify-between">
          <Skeleton className="w-44 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="w-28 h-3" />
                </div>
                <Skeleton className="w-16 h-3" />
              </div>
              <Skeleton className="w-full h-1 rounded-full" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}

/* ─── Forecast ─────────────────────────────────────────────── */
function ForecastSkeleton() {
  return (
    <div className="space-y-5 lg:space-y-6">
      {/* Hourly */}
      <SkeletonCard className="p-6 space-y-5">
        <div className="flex justify-between flex-wrap gap-3">
          <Skeleton className="w-36 h-4" />
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="w-20 h-8 rounded-lg" />)}
          </div>
        </div>
        <Skeleton className="w-full h-44 rounded-lg" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="w-[54px] h-[72px] rounded-xl shrink-0" />
          ))}
        </div>
      </SkeletonCard>

      {/* 7-day */}
      <SkeletonCard className="p-6 space-y-5">
        <div className="flex justify-between">
          <Skeleton className="w-48 h-4" />
          <div className="flex gap-4">
            <Skeleton className="w-20 h-8" />
            <Skeleton className="w-16 h-8" />
          </div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 space-y-1.5">
              <Skeleton className="w-full h-1 rounded-full" />
              <Skeleton className="w-full h-2.5 rounded" />
              <Skeleton className="w-full h-3 rounded" />
            </div>
          ))}
        </div>
        <Skeleton className="w-full h-40 rounded-lg" />
      </SkeletonCard>
    </div>
  );
}

/* ─── Map ──────────────────────────────────────────────────── */
function MapSkeleton() {
  return (
    <SkeletonCard className="overflow-hidden">
      <div className="p-6 border-b border-border/25 flex justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="w-44 h-4" />
            <Skeleton className="w-28 h-3" />
          </div>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3].map(i => <Skeleton key={i} className="w-20 h-8 rounded-lg" />)}
        </div>
      </div>
      <Skeleton className="w-full h-[420px] lg:h-[480px] rounded-none" />
    </SkeletonCard>
  );
}

/* ─── Full dashboard skeleton ──────────────────────────────── */
export function DashboardSkeleton() {
  return (
    <div>
      {/* Hero */}
      <HeroSkeleton />

      {/* Risk */}
      <div className="section-divider">
        <SectionLabelSkeleton />
        <RiskSkeleton />
      </div>

      {/* Intelligence */}
      <div className="section-divider">
        <SectionLabelSkeleton />
        <IntelligenceSkeleton />
      </div>

      {/* Analytics */}
      <div className="section-divider">
        <SectionLabelSkeleton />
        <AnalyticsSkeleton />
      </div>

      {/* Forecast */}
      <div className="section-divider">
        <SectionLabelSkeleton />
        <ForecastSkeleton />
      </div>

      {/* Map */}
      <div className="section-divider">
        <SectionLabelSkeleton />
        <MapSkeleton />
      </div>
    </div>
  );
}
