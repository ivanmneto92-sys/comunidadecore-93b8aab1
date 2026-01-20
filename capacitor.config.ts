import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.meeo.core',
  appName: 'MEOO CORE',
  webDir: 'dist',
  server: {
    allowNavigation: ['meoocore.com.br'],
  },
};

export default config;
