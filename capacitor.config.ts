import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.e3getmehired.gifthub',
  appName: 'Gifthub',
  webDir: 'out',
  server:{
    url: 'https://gifthub-five.vercel.app/'
  }
};

export default config;
