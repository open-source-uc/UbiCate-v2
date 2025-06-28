import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.uc.ubicate',
  appName: 'UbiCate UC',
  webDir: 'dist',
  server: {
    url: 'https://ubicate.osuc.dev/',
    cleartext: false
  }
};

export default config;
