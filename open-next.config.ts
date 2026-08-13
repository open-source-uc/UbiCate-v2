import { defineCloudflareConfig, type OpenNextConfig } from "@opennextjs/cloudflare";

// Serwist genera el service worker con un plugin de webpack, así que el build de Next no puede
// correr en Turbopack (el default desde Next 16): al detectar config de webpack falla a propósito.
// Por eso se fuerza `--webpack` en vez de dejar el `npm run build` que usa OpenNext por defecto.
const config: OpenNextConfig = {
  ...defineCloudflareConfig(),
  buildCommand: "next build --webpack",
};

export default config;
