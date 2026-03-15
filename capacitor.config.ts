import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.luzcontrol.app',
  appName: 'Luz Control',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
