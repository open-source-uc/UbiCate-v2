interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

class DataCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private refreshTimers = new Map<string, ReturnType<typeof setInterval>>();
  private lastRefreshMap = new Map<string, Date>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs = 5 * 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttlMs) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs: ttlMs ?? this.defaultTtlMs,
    });
  }

  invalidate(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }

  isStale(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > entry.ttlMs;
  }

  getLastRefresh(key?: string): Date | null {
    if (key) {
      return this.lastRefreshMap.get(key) ?? null;
    }
    let latest: Date | null = null;
    for (const date of this.lastRefreshMap.values()) {
      if (!latest || date > latest) latest = date;
    }
    return latest;
  }

  startRefresh(key: string, intervalMs: number, refreshFn: () => Promise<void>): void {
    this.stopRefresh(key);
    const timer = setInterval(async () => {
      try {
        await refreshFn();
        this.lastRefreshMap.set(key, new Date());
      } catch (error) {
        console.error(`Cache refresh error for "${key}":`, error);
      }
    }, intervalMs);
    this.refreshTimers.set(key, timer);
  }

  stopRefresh(key?: string): void {
    if (key) {
      const timer = this.refreshTimers.get(key);
      if (timer) {
        clearInterval(timer);
        this.refreshTimers.delete(key);
      }
    } else {
      for (const [, timer] of this.refreshTimers) {
        clearInterval(timer);
      }
      this.refreshTimers.clear();
    }
  }
}

const GLOBAL_CACHE_KEY = "__ubicateDataCache";

function getGlobalCache(): DataCache {
  if (!(globalThis as any)[GLOBAL_CACHE_KEY]) {
    (globalThis as any)[GLOBAL_CACHE_KEY] = new DataCache();
  }
  return (globalThis as any)[GLOBAL_CACHE_KEY] as DataCache;
}

export const cache = getGlobalCache();
export { DataCache };
