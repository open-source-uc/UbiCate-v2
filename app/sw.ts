import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { ExpirationPlugin, NetworkFirst, NetworkOnly, Serwist, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const placesExpiration = new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 2592000 });
const eventsExpiration = new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 2592000 });
const routesExpiration = new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 2592000 });

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
      handler: new NetworkFirst({ cacheName: "ubicate-data", plugins: [placesExpiration] }),
    },
    {
      matcher: ({ url }) => url.pathname === "/api/ubicate",
      handler: new StaleWhileRevalidate({ cacheName: "ubicate-data", plugins: [placesExpiration] }),
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
      handler: new NetworkFirst({ cacheName: "ubicate-events", plugins: [eventsExpiration] }),
    },
    {
      matcher: ({ url }) => url.pathname === "/api/events",
      handler: new StaleWhileRevalidate({ cacheName: "ubicate-events", plugins: [eventsExpiration] }),
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
      handler: new NetworkFirst({ cacheName: "ubicate-routes", plugins: [routesExpiration] }),
    },
    {
      matcher: ({ url }) => url.pathname === "/api/routes",
      handler: new StaleWhileRevalidate({ cacheName: "ubicate-routes", plugins: [routesExpiration] }),
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
