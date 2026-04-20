import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.formixai0.app',
  appName: 'Formix AI',
  webDir: 'out',
  server: {
    url: 'https://formix-ai0.vercel.app',
    cleartext: true
  }
};

export default config;
