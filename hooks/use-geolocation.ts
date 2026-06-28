// ============================================================
// ClimaSense — Browser Geolocation Hook
// Priority: Browser GPS → IP fallback → default city
// Returns precise locality (neighbourhood/district/city/state)
// ============================================================

'use client';

import { useState, useCallback, useRef } from 'react';
import type { GeolocationState, GeolocationStatus } from '@/lib/types';

// High accuracy for precise locality detection
const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 12_000,
  maximumAge: 0, // always get fresh position — no stale cache
};

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    status: 'idle',
    coords: null,
    city: null,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const request = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setState({
        status: 'unavailable',
        coords: null,
        city: null,
        error: 'Geolocation is not supported by this browser.',
      });
      return;
    }

    setState(prev => ({ ...prev, status: 'requesting', error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));

        // Immediately mark granted with coords so dashboard starts loading
        setState({
          status: 'granted',
          coords: { lat, lng },
          city: null,
          error: null,
        });

        // Reverse geocode via our server endpoint
        try {
          abortRef.current?.abort();
          abortRef.current = new AbortController();

          const res = await fetch(
            `/api/reverse-geocode?lat=${lat}&lng=${lng}`,
            { signal: abortRef.current.signal }
          );

          if (res.ok) {
            const data = await res.json();
            // Use the most precise label available
            const displayName: string =
              data?.displayName ??
              data?.locality ??
              data?.city ??
              'Current Location';
            setState(prev => ({ ...prev, city: displayName }));
          } else {
            setState(prev => ({ ...prev, city: 'Current Location' }));
          }
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') return;
          setState(prev => ({ ...prev, city: 'Current Location' }));
        }
      },
      async (err) => {
        let status: GeolocationStatus = 'error';
        let message = 'Unable to retrieve location.';

        if (err.code === err.PERMISSION_DENIED) {
          status = 'denied';
          message = 'Location permission denied.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          status = 'unavailable';
          message = 'Location unavailable.';
        } else if (err.code === err.TIMEOUT) {
          status = 'error';
          message = 'Location request timed out.';
        }

        // IP-based fallback when GPS fails/denied
        try {
          abortRef.current?.abort();
          abortRef.current = new AbortController();
          const ipRes = await fetch('/api/ip-location', {
            signal: abortRef.current.signal,
          });
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData?.city && ipData?.lat && ipData?.lng) {
              setState({
                status: 'granted',
                coords: { lat: ipData.lat, lng: ipData.lng },
                city: ipData.displayName ?? ipData.city,
                error: null,
              });
              return;
            }
          }
        } catch { /* silent — fall through to error state */ }

        setState({ status, coords: null, city: null, error: message });
      },
      GEO_OPTIONS
    );
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ status: 'idle', coords: null, city: null, error: null });
  }, []);

  return { ...state, request, reset };
}
