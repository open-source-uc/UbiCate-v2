import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DataCache } from "@/lib/db/cache";

const TTL = 5 * 60 * 1000;
const STALE_GRACE_MS = 30 * 60 * 1000;

// Se instancia una DataCache limpia por test: el `cache` exportado es un singleton en globalThis y
// arrastraría estado entre casos.
let cache: DataCache;

beforeEach(() => {
  vi.useFakeTimers();
  cache = new DataCache(TTL);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getOrLoad", () => {
  it("carga una vez y sirve del store mientras la entrada esté fresca", async () => {
    const loader = vi.fn().mockResolvedValue("v1");

    await expect(cache.getOrLoad("k", loader)).resolves.toBe("v1");
    vi.advanceTimersByTime(TTL - 1);
    await expect(cache.getOrLoad("k", loader)).resolves.toBe("v1");

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("con la entrada vencida dentro de la gracia sirve lo stale y revalida en background", async () => {
    const loader = vi.fn().mockResolvedValueOnce("v1").mockResolvedValueOnce("v2");

    await cache.getOrLoad("k", loader);
    vi.setSystemTime(Date.now() + TTL + 1);

    // Devuelve lo viejo de inmediato...
    await expect(cache.getOrLoad("k", loader)).resolves.toBe("v1");
    expect(loader).toHaveBeenCalledTimes(2);

    // ...y la recarga en curso deja lo nuevo para la próxima lectura.
    await vi.advanceTimersByTimeAsync(0);
    await expect(cache.getOrLoad("k", loader)).resolves.toBe("v2");
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("pasada la gracia bloquea y devuelve el valor nuevo", async () => {
    const loader = vi.fn().mockResolvedValueOnce("v1").mockResolvedValueOnce("v2");

    await cache.getOrLoad("k", loader);
    vi.setSystemTime(Date.now() + TTL + STALE_GRACE_MS + 1);

    await expect(cache.getOrLoad("k", loader)).resolves.toBe("v2");
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("respeta el ttlMs por llamada por encima del default", async () => {
    const loader = vi.fn().mockResolvedValueOnce("v1").mockResolvedValueOnce("v2");

    await cache.getOrLoad("k", loader, { ttlMs: 1000 });
    vi.setSystemTime(Date.now() + 1001);

    await expect(cache.getOrLoad("k", loader, { ttlMs: 1000 })).resolves.toBe("v1");
    await vi.advanceTimersByTimeAsync(0);
    await expect(cache.getOrLoad("k", loader, { ttlMs: 1000 })).resolves.toBe("v2");
  });

  it("forceFresh salta el store aunque la entrada esté fresca", async () => {
    const loader = vi.fn().mockResolvedValueOnce("v1").mockResolvedValueOnce("v2");

    await cache.getOrLoad("k", loader);
    await expect(cache.getOrLoad("k", loader, { forceFresh: true })).resolves.toBe("v2");
    expect(loader).toHaveBeenCalledTimes(2);
  });
});

describe("single-flight", () => {
  it("N llamadas concurrentes con la misma key comparten UNA carga", async () => {
    let resolve!: (value: string) => void;
    const loader = vi.fn(() => new Promise<string>((r) => (resolve = r)));

    const calls = [cache.getOrLoad("k", loader), cache.getOrLoad("k", loader), cache.getOrLoad("k", loader)];
    resolve("v1");

    await expect(Promise.all(calls)).resolves.toEqual(["v1", "v1", "v1"]);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("keys distintas no comparten la carga", async () => {
    const loader = vi.fn(async (value: string) => value);

    await Promise.all([cache.getOrLoad("a", () => loader("a")), cache.getOrLoad("b", () => loader("b"))]);

    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("un loader que rechaza no deja la key trabada: la siguiente llamada reintenta", async () => {
    const loader = vi.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce("v1");

    await expect(cache.getOrLoad("k", loader)).rejects.toThrow("boom");
    await expect(cache.getOrLoad("k", loader)).resolves.toBe("v1");
    expect(loader).toHaveBeenCalledTimes(2);
  });
});

describe("generaciones", () => {
  // Es la garantía de que un admin que acaba de aprobar una propuesta no recibe la foto previa.
  it("un invalidate durante una carga en vuelo descarta ese resultado", async () => {
    let resolveSlow!: (value: string) => void;
    const slow = () => new Promise<string>((r) => (resolveSlow = r));

    const inFlight = cache.getOrLoad("k", slow);
    cache.invalidate("k");
    resolveSlow("viejo");
    await expect(inFlight).resolves.toBe("viejo");

    // El resultado rancio no quedó en el store: la siguiente lectura vuelve a cargar.
    const fresh = vi.fn().mockResolvedValue("nuevo");
    await expect(cache.getOrLoad("k", fresh)).resolves.toBe("nuevo");
    expect(fresh).toHaveBeenCalledTimes(1);
  });

  it("tras invalidar, una llamada nueva no reutiliza la promesa en vuelo de la generación vieja", async () => {
    const slow = () => new Promise<string>(() => {});

    void cache.getOrLoad("k", slow);
    cache.invalidate("k");

    const fresh = vi.fn().mockResolvedValue("nuevo");
    await expect(cache.getOrLoad("k", fresh)).resolves.toBe("nuevo");
    expect(fresh).toHaveBeenCalledTimes(1);
  });
});

describe("invalidate", () => {
  it("con key tira solo esa entrada", async () => {
    const a = vi.fn().mockResolvedValueOnce("a1").mockResolvedValueOnce("a2");
    const b = vi.fn().mockResolvedValueOnce("b1").mockResolvedValueOnce("b2");

    await cache.getOrLoad("a", a);
    await cache.getOrLoad("b", b);
    cache.invalidate("a");

    await expect(cache.getOrLoad("a", a)).resolves.toBe("a2");
    await expect(cache.getOrLoad("b", b)).resolves.toBe("b1");
  });

  it("sin key tira todas", async () => {
    const a = vi.fn().mockResolvedValueOnce("a1").mockResolvedValueOnce("a2");
    const b = vi.fn().mockResolvedValueOnce("b1").mockResolvedValueOnce("b2");

    await cache.getOrLoad("a", a);
    await cache.getOrLoad("b", b);
    cache.invalidate();

    await expect(cache.getOrLoad("a", a)).resolves.toBe("a2");
    await expect(cache.getOrLoad("b", b)).resolves.toBe("b2");
  });
});
