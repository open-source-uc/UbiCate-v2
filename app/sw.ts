import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher({ request }) {
        return request.destination === "image";
      },
      handler: new StaleWhileRevalidate({ cacheName: "images" }),
    },
    {
      matcher({ request }) {
        return request.destination === "script" || request.destination === "style";
      },
      handler: new CacheFirst({ cacheName: "static-resources" }),
    },
  ],
});

serwist.addEventListeners();
