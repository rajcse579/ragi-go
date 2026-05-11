import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ragigo.go',
  appName: 'Raagi GO',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
