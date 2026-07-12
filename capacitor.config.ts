import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cfnhs.scanner',
  appName: 'CFNHS Scanner',
  webDir: 'public/build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
