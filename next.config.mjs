/** @type {import('next').NextConfig} */
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // No recargar la página al reconectar (Serwist lo hace por defecto). Los datos se refrescan en
  // memoria vía React Query (sidebarCtx refetchea al volver online), sin recargar el navegador.
  reloadOnOnline: false,
});

// Expone los bindings de Cloudflare (el bucket R2 de tiles y glyphs) a `next dev`.
// Desde Next 16 `next dev` ya no lee el config dos veces, así que el chequeo va por NODE_ENV.
if (process.env.NODE_ENV === "development") {
  await initOpenNextCloudflareForDev();
}

export default withSerwist({ devIndicators: false });
