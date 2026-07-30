/** @type {import('next').NextConfig} */
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  // No recargar la página al reconectar (Serwist lo hace por defecto). Los datos se refrescan en
  // memoria vía React Query (sidebarCtx refetchea al volver online), sin recargar el navegador.
  reloadOnOnline: false,
});

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

export default withSerwist({ devIndicators: false });
