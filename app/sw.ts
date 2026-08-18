import type { PrecacheEntry, SerwistGlobalConfig, SerwistPlugin } from "serwist";
import {
  CacheFirst,
  CacheableResponsePlugin,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const placesExpiration = new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 2592000 });
const eventsExpiration = new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 2592000 });
const routesExpiration = new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 2592000 });

// Cuando el HTTP cache del navegador resuelve la revalidación con un 304, el fetch() del SW NO ve un
// 304: recibe un 200 con el cuerpo completo reconstruido desde disco. Serwist entonces lo reescribe
// entero en Cache Storage (fetchAndCachePut) en cada acierto, o sea ~500 KB de write por poll y por
// endpoint sin que haya cambiado nada. Comparar el ETag corta ese write; no se pierde fidelidad porque
// el ETag es un hash del body (ETag igual ⇒ body igual).
//
// ⚠️ Declarar un cacheWillUpdate propio reemplaza al cacheOkAndOpaquePlugin implícito de Serwist, que
// además admitía respuestas opacas (status 0). De ahí el filtro explícito por 200: para estos
// endpoints una opaca no sirve. El nombre del cache se cierra por factory porque
// CacheWillUpdateCallbackParam no lo incluye (solo request, response, event y state).
const skipCacheWriteIfSameEtag = (cacheName: string): SerwistPlugin => ({
  cacheWillUpdate: async ({ request, response }) => {
    if (response.status !== 200) return null;

    const incoming = response.headers.get("ETag");
    if (!incoming) return response;

    const cached = await (await caches.open(cacheName)).match(request);
    return cached?.headers.get("ETag") === incoming ? null : response;
  },
});

const placesPlugins = [placesExpiration, skipCacheWriteIfSameEtag("ubicate-data")];
const eventsPlugins = [eventsExpiration, skipCacheWriteIfSameEtag("ubicate-events")];
const routesPlugins = [routesExpiration, skipCacheWriteIfSameEtag("ubicate-routes")];

// Los tiles llegan como /api/{z}/{x}/{y}. Se compara por segmentos y no por prefijo para no tragarse
// /api/ubicate, /api/events ni /api/font.
const isMapTilePath = (pathname: string) => {
  const [, api, ...coords] = pathname.split("/");
  return api === "api" && coords.length === 3 && coords.every((c) => c !== "" && Number.isInteger(Number(c)));
};

const serwist = new Serwist({
  precacheEntries: [...(self.__SW_MANIFEST || [])],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request }) => request.destination === "image",
      handler: new StaleWhileRevalidate({ cacheName: "images" }),
    },
    {
      matcher: ({ request }) => request.destination === "script" || request.destination === "style",
      handler: new NetworkFirst({
        cacheName: "static-resources",
        networkTimeoutSeconds: 3,
      }),
    },
    {
      matcher: ({ url, request }) =>
        url.pathname === "/api/ubicate" && request.headers.get("X-Ubicate-Fresh") === "true",
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url, request }) =>
        url.pathname === "/api/ubicate" && request.headers.get("X-Ubicate-Revalidate") === "true",
      handler: new NetworkFirst({ cacheName: "ubicate-data", plugins: placesPlugins }),
    },
    {
      matcher: ({ url }) => url.pathname === "/api/ubicate",
      handler: new StaleWhileRevalidate({ cacheName: "ubicate-data", plugins: placesPlugins }),
    },
    {
      // Eventos: mismo patrón que /api/ubicate. NetworkOnly con X-Ubicate-Fresh (debug/refetch),
      // StaleWhileRevalidate 30 días para carga offline.
      matcher: ({ url, request }) =>
        url.pathname === "/api/events" && request.headers.get("X-Ubicate-Fresh") === "true",
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url, request }) =>
        url.pathname === "/api/events" && request.headers.get("X-Ubicate-Revalidate") === "true",
      handler: new NetworkFirst({ cacheName: "ubicate-events", plugins: eventsPlugins }),
    },
    {
      matcher: ({ url }) => url.pathname === "/api/events",
      handler: new StaleWhileRevalidate({ cacheName: "ubicate-events", plugins: eventsPlugins }),
    },
    {
      // Rutas: mismo patrón que /api/ubicate y /api/events.
      matcher: ({ url, request }) =>
        url.pathname === "/api/routes" && request.headers.get("X-Ubicate-Fresh") === "true",
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url, request }) =>
        url.pathname === "/api/routes" && request.headers.get("X-Ubicate-Revalidate") === "true",
      handler: new NetworkFirst({ cacheName: "ubicate-routes", plugins: routesPlugins }),
    },
    {
      matcher: ({ url }) => url.pathname === "/api/routes",
      handler: new StaleWhileRevalidate({ cacheName: "ubicate-routes", plugins: routesPlugins }),
    },
    {
      // Glyphs de las fuentes del mapa. El .pbf de un par (fuente, rango) es función del archivo de
      // fuente subido a R2: no cambia nunca. Va con cache propio y CacheFirst porque antes caía en el
      // catch-all de /api/, que es StaleWhileRevalidate y por lo tanto revalidaba por red en CADA
      // acierto — un request por rango en cada carga de la app.
      matcher: ({ url }) => url.pathname.startsWith("/api/font/"),
      handler: new CacheFirst({
        cacheName: "map-glyphs",
        plugins: [
          new CacheableResponsePlugin({ statuses: [200] }),
          new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 31536000, purgeOnQuotaError: true }),
        ],
      }),
    },
    {
      // Tiles del basemap: mismo problema que los glyphs, pero con mucho más volumen (revalidaban en
      // cada paneo). ⚠️ Con CacheFirst, si se vuelve a subir el basemap a R2 los usuarios con SW
      // pueden ver tiles viejos hasta que expire el TTL; para forzarlo, cambiar este cacheName.
      matcher: ({ url }) => isMapTilePath(url.pathname),
      handler: new CacheFirst({
        cacheName: "map-tiles",
        plugins: [
          new CacheableResponsePlugin({ statuses: [200] }),
          new ExpirationPlugin({ maxEntries: 3000, maxAgeSeconds: 2592000, purgeOnQuotaError: true }),
        ],
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new StaleWhileRevalidate({
        cacheName: "api-responses",
        plugins: [
          new ExpirationPlugin({ maxEntries: 600, maxAgeSeconds: 2592000, purgeOnQuotaError: true }),
          {
            cacheWillUpdate: async ({ response }) => (response.status === 200 ? response : null),
          },
        ],
      }),
    },
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({ cacheName: "pages", networkTimeoutSeconds: 3 }),
    },
  ],
});

serwist.addEventListeners();
