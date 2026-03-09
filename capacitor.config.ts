import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.yourname.tasks',
  appName: 'tasks',
  // No webDir — loads the live Vercel URL instead of a local bundle.
  // Replace the URL below with your actual Vercel deployment URL.
  server: {
    url: 'https://task-planner-9ruh58skv-wojtekzaniewski-2506s-projects.vercel.app',
    cleartext: false,
  },
}

export default config
