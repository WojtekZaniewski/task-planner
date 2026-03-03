import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { ServiceWorkerRegister } from '@/components/pwa/sw-register'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { SplashScreen } from '@/components/splash-screen'
import './globals.css'

const molde = localFont({
  src: [
    {
      path: '../public/fonts/Molde-SemiExpanded-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Molde-SemiExpanded-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
})

const bogart = localFont({
  src: [
    {
      path: '../public/fonts/Bogart-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Bogart-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'tasks',
  description: 'Planner zadań dla Twojego zespołu. Organizuj, planuj i współpracuj.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'tasks',
  },
}

export const viewport: Viewport = {
  themeColor: '#F97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
      </head>
      <body className={`${molde.variable} ${bogart.variable} font-sans`}>
        <ThemeProvider>
          <SplashScreen />
          {children}
          <Toaster position="bottom-right" richColors />
          <ServiceWorkerRegister />
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  )
}
