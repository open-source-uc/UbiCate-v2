import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkFirst, Serwist, StaleWhileRevalidate } from "serwist";

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
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new StaleWhileRevalidate({
        cacheName: "map-tiles",
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
