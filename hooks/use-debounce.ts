// ============================================================
// ClimaSense — Debounce Hook
// Prevents excessive API calls during user input
// ============================================================

'use client';

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

// Debounced callback version
export function useDebouncedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delayMs: number = 500
): (...args: Parameters<T>) => void {
  const timerRef = { current: null as ReturnType<typeof setTimeout> | null };

  return (...args: Parameters<T>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      callback(...args);
    }, delayMs);
  };
}
