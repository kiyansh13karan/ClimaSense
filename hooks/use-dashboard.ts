// ============================================================
// ClimaSense — Dashboard Data Hook
// Supports location-string and lat/lng coords.
// Single effect handles reset + fetch atomically (no race).
// ============================================================

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DashboardData, ApiResponse } from '@/lib/types';

interface UseDashboardOptions {
  location: string;
  coords?: { lat: number; lng: number } | null;
  demoMode?: boolean;
  autoRefreshMs?: number;
}

interface UseDashboardReturn {
  data: DashboardData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  source: 'live' | 'mock' | 'cached' | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

// Module-level client cache — survives re-renders, cleared on page reload
const clientCache = new Map<string, { data: DashboardData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function buildCacheKey(
  location: string,
  coords?: { lat: number; lng: number } | null,
  demo?: boolean
): string {
  const base = coords
    ? `coords:${coords.lat.toFixed(2)},${coords.lng.toFixed(2)}`
    : location.toLowerCase().trim();
  return `${base}:${demo ? 'demo' : 'live'}`;
}

function buildApiUrl(
  location: string,
  coords?: { lat: number; lng: number } | null,
  demoMode?: boolean,
  forceRefresh?: boolean
): string {
  const params = new URLSearchParams();
  if (coords) {
    params.set('lat', String(coords.lat));
    params.set('lng', String(coords.lng));
    if (location) params.set('location', location);
  } else {
    params.set('location', location || 'Houston');
  }
  if (demoMode) params.set('demo', 'true');
  if (forceRefresh) params.set('refresh', 'true');
  return `/api/dashboard-data?${params}`;
}

export function useDashboard({
  location,
  coords,
  demoMode = false,
  autoRefreshMs,
}: UseDashboardOptions): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'live' | 'mock' | 'cached' | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track current fetch key to detect stale responses
  const currentKeyRef = useRef<string>('');

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!location && !coords) return;

      const cacheKey = buildCacheKey(location, coords, demoMode);
      currentKeyRef.current = cacheKey;

      // Client-side cache hit (skip on force refresh)
      if (!forceRefresh) {
        const cached = clientCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          // Only apply if this is still the current request
          if (currentKeyRef.current === cacheKey) {
            setData(cached.data);
            setSource('cached');
            setIsLoading(false);
            setIsRefreshing(false);
          }
          return;
        }
      }

      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;

      setError(null);

      try {
        const url = buildApiUrl(location, coords, demoMode, forceRefresh);
        const res = await fetch(url, { signal });

        if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);

        const json: ApiResponse<DashboardData> = await res.json();
        if (!json.success || !json.data) {
          throw new Error(json.error ?? 'Failed to load dashboard data');
        }

        // Discard stale response if location changed while fetching
        if (currentKeyRef.current !== cacheKey) return;

        clientCache.set(cacheKey, { data: json.data, timestamp: Date.now() });
        setData(json.data);
        setSource(json.data.meta.source);
        setLastUpdated(new Date());
        setError(null);

      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (currentKeyRef.current !== cacheKey) return;

        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(message);

        // Try demo fallback so UI isn't blank
        try {
          const fallbackUrl = buildApiUrl(location, null, true, false);
          const fallbackRes = await fetch(fallbackUrl);
          const fallbackJson: ApiResponse<DashboardData> = await fallbackRes.json();
          if (fallbackJson.data && currentKeyRef.current === cacheKey) {
            setData(fallbackJson.data);
            setSource('mock');
          }
        } catch { /* silent */ }

      } finally {
        if (currentKeyRef.current === cacheKey) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location, coords?.lat, coords?.lng, demoMode]
  );

  // Single effect: reset state + fetch atomically when dependencies change
  useEffect(() => {
    // Reset to loading state immediately
    setData(null);
    setIsLoading(true);
    setIsRefreshing(false);
    setError(null);

    fetchData(false);

    return () => {
      abortRef.current?.abort();
    };
  }, [fetchData]);

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefreshMs) return;
    refreshTimerRef.current = setInterval(() => {
      setIsRefreshing(true);
      fetchData(true);
    }, autoRefreshMs);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [autoRefreshMs, fetchData]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  return { data, isLoading, isRefreshing, error, source, lastUpdated, refresh };
}
