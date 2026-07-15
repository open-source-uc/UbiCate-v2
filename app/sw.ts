import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { ExpirationPlugin, NetworkFirst, NetworkOnly, Serwist, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

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
      matcher: ({ url }) => url.pathname === "/api/ubicate",
      handler: new StaleWhileRevalidate({
        cacheName: "ubicate-data",
        plugins: [new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 2592000 })],
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new StaleWhileRevalidate({
        cacheName: "api-responses",
        plugins: [
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
