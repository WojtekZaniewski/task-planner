import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.yourname.tasks',
  appName: 'tasks',
  // No webDir — loads the live Vercel URL instead of a local bundle.
  // Replace the URL below with your actual Vercel deployment URL.
  server: {
    url: 'https://your-app.vercel.app',
    cleartext: false,
  },
}

export default config
