interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const STALE_GRACE_MS = 30 * 60 * 1000;

class DataCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private inFlight = new Map<string, { promise: Promise<unknown>; generation: number }>();
  private generations = new Map<string, number>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs = 5 * 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  private set<T>(key: string, data: T, ttlMs?: number): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs: ttlMs ?? this.defaultTtlMs,
    });
  }

  private load<T>(key: string, loader: () => Promise<T>, ttlMs?: number): Promise<T> {
    const current = this.generations.get(key) ?? 0;
    const existing = this.inFlight.get(key);
    if (existing && existing.generation >= current) {
      return existing.promise as Promise<T>;
    }

    const generation = current;
    const promise = (async () => {
      const data = await loader();
      if (generation >= (this.generations.get(key) ?? 0)) this.set(key, data, ttlMs);
      return data;
    })();

    const entry = { promise, generation };
    this.inFlight.set(key, entry);
    promise
      .catch(() => {})
      .finally(() => {
        if (this.inFlight.get(key) === entry) this.inFlight.delete(key);
      });

    return promise;
  }

  async getOrLoad<T>(
    key: string,
    loader: () => Promise<T>,
    options?: { ttlMs?: number; forceFresh?: boolean },
  ): Promise<T> {
    const ttlMs = options?.ttlMs;
    if (options?.forceFresh) return this.load(key, loader, ttlMs);

    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (entry) {
      const age = Date.now() - entry.timestamp;
      if (age <= entry.ttlMs) return entry.data;
      if (age <= entry.ttlMs + STALE_GRACE_MS) {
        void this.load(key, loader, ttlMs).catch(() => {});
        return entry.data;
      }
    }

    return this.load(key, loader, ttlMs);
  }

  private bump(key: string): void {
    this.generations.set(key, (this.generations.get(key) ?? 0) + 1);
  }

  invalidate(key?: string): void {
    if (key) {
      this.bump(key);
      this.store.delete(key);
      return;
    }

    for (const k of new Set([...this.store.keys(), ...this.inFlight.keys()])) this.bump(k);
    this.store.clear();
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
