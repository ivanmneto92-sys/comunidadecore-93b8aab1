import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c2aa768bb1fe4c14bb1d1255a1430f00',
  appName: 'comunidadecore',
  webDir: 'dist',
  server: {
    // Hot-reload for development - remove this section for production builds
    url: 'https://c2aa768b-b1fe-4c14-bb1d-1255a1430f00.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
