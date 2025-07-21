/** @type {import('next').NextConfig} */
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
});

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

export default withSerwist({
  experimental: {
    appDir: true,
  },
});
