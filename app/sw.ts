import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  StaleWhileRevalidate,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: [
    ...(self.__SW_MANIFEST || []),
    "/", // precache root page
  ],
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
      handler: new StaleWhileRevalidate({ cacheName: "static-resources" }),
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
      // Manejo mejorado para navegación offline
      matcher: ({ request }) => request.mode === "navigate",
      handler: new StaleWhileRevalidate({
        cacheName: "pages",
        plugins: [
          {
            // Mejor manejo de errores de red
            handlerDidError: async ({ request }) => {
              console.log('Navigation failed, trying cache fallbacks');
              
              // 1. Intentar con la URL exacta en precache
              const precacheResponse = await caches.match(request.url);
              if (precacheResponse) {
                return precacheResponse;
              }
              
              // 2. Intentar con la página raíz precacheada
              const rootResponse = await caches.match("/");
              if (rootResponse) {
                return rootResponse;
              }
              
              // 3. Buscar cualquier página HTML en cache
              const pagesCache = await caches.open("pages");
              const cachedResponses = await pagesCache.keys();
              
              for (const cachedRequest of cachedResponses) {
                if (cachedRequest.mode === 'navigate') {
                  const cachedResponse = await pagesCache.match(cachedRequest);
                  if (cachedResponse) {
                    return cachedResponse;
                  }
                }
              }
              
              // 4. Fallback final
              return new Response(
                `<!DOCTYPE html>
                <html>
                <head>
                  <title>Sin conexión</title>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                </head>
                <body>
                  <h1>Sin conexión</h1>
                  <p>No se puede cargar la página. Verifica tu conexión a internet.</p>
                  <button onclick="window.location.reload()">Reintentar</button>
                </body>
                </html>`,
                { 
                  status: 200,
                  statusText: 'OK',
                  headers: { 'Content-Type': 'text/html; charset=utf-8' }
                }
              );
            },
          },
          {
            // Asegurar que las respuestas exitosas se cacheen
            cacheWillUpdate: async ({ response }) => {
              return response.status === 200 ? response : null;
            },
          }
        ],
      }),
    },
  ],
});

// Agregar listener adicional para manejar offline
self.addEventListener('fetch', (event) => {
  // Solo para navegación cuando estamos offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(async () => {
          // Si falla la red, buscar en cache
          console.log('Network failed, searching cache for:', event.request.url);
          
          // Buscar respuesta exacta
          let response = await caches.match(event.request.url);
          if (response) return response;
          
          // Buscar respuesta similar (sin query params)
          const url = new URL(event.request.url);
          url.search = '';
          response = await caches.match(url.href);
          if (response) return response;
          
          // Fallback a página raíz
          response = await caches.match('/');
          if (response) return response;
          
          // Página de error personalizada
          return new Response(
            `<!DOCTYPE html>
            <html>
            <head>
              <title>Página no disponible</title>
              <meta charset="utf-8">
            </head>
            <body>
              <h1>Página no disponible offline</h1>
              <p>Esta página no está disponible sin conexión.</p>
              <a href="/">Ir al inicio</a>
            </body>
            </html>`,
            { 
              status: 200, 
              headers: { 'Content-Type': 'text/html; charset=utf-8' } 
            }
          );
        })
    );
  }
});

serwist.addEventListeners();