// ============================================================
// ClimaSense — In-Memory Cache with Stale-While-Revalidate
// Prevents excessive API calls and reduces rate-limit risk
// ============================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      key,
    });
  }

  get<T>(key: string): { data: T; isStale: boolean } | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    const isStale = age > CACHE_DURATION_MS;

    return { data: entry.data, isStale };
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidateAll(): void {
    this.store.clear();
  }

  getAge(key: string): number | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    return Date.now() - entry.timestamp;
  }
}

// Singleton cache instance
export const cache = new MemoryCache();

// ─── Cache key builders ───────────────────────────────────────
export const cacheKeys = {
  dashboard: (location: string) => `dashboard:${location.toLowerCase().trim()}`,
  weather: (location: string) => `weather:${location.toLowerCase().trim()}`,
  forecast: (location: string) => `forecast:${location.toLowerCase().trim()}`,
  aiInsights: (location: string, riskScore: number) =>
    `ai:${location.toLowerCase().trim()}:${Math.round(riskScore / 10) * 10}`,
};
