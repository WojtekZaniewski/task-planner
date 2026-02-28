import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import localFont from 'next/font/local'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { ServiceWorkerRegister } from '@/components/pwa/sw-register'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { SplashScreen } from '@/components/splash-screen'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  weight: '700',
})

const bogart = localFont({
  src: [
    {
      path: '../public/fonts/Bogart-Semibold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Bogart-Bold.ttf',
      weight: '700',
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
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${montserrat.variable} ${bogart.variable} font-sans`}>
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
