// ============================================================
// ClimaSense — Demo Mode Hook
// Default: LIVE mode. Only falls back to demo if user sets it.
// ============================================================

'use client';

import { useState, useEffect } from 'react';

const DEMO_MODE_KEY = 'atmosiq:demo-mode';

export function useDemoMode() {
  // Default FALSE — live mode on first visit
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DEMO_MODE_KEY);
      if (stored !== null) {
        setIsDemoMode(stored === 'true');
      }
      // If nothing stored → stays false (live mode)
    } catch {
      // localStorage unavailable → stay live
    }
    setHydrated(true);
  }, []);

  const toggleDemoMode = () => {
    setIsDemoMode(prev => {
      const next = !prev;
      try { localStorage.setItem(DEMO_MODE_KEY, String(next)); } catch { /* silent */ }
      return next;
    });
  };

  return { isDemoMode, toggleDemoMode, hydrated };
}
