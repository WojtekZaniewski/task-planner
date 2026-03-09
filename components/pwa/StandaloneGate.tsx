'use client'

import { useState, useEffect } from 'react'
import { Share } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function InstallGate({ isIos }: { isIos: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installing, setInstalling] = useState(false)
  const t = useTranslations()

  useEffect(() => {
    function handleBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    setInstalling(true)
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setInstalling(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      {/* App icon */}
      <div className="flex flex-col items-center gap-4">
        <img
          src="/icons/icon-192x192.png"
          alt="tasks"
          className="w-24 h-24 rounded-3xl shadow-lg"
        />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.gate.subtitle}</p>
        </div>
      </div>

      {/* Install card */}
      <div className="glass rounded-2xl p-6 w-full max-w-sm space-y-5">
        <p className="text-sm font-semibold text-foreground text-center">
          {t.gate.installToContinue}
        </p>

        {isIos ? (
          <div className="space-y-3">
            <Step number={1}>
              {t.gate.iosStep1prefix} <Share className="inline h-4 w-4 mx-1 align-text-bottom" />
              {t.gate.iosStep1suffix}
            </Step>
            <Step number={2}>
              {t.gate.iosStep2}
            </Step>
            <Step number={3}>
              {t.gate.iosStep3}
            </Step>
          </div>
        ) : (
          <div className="space-y-3">
            {deferredPrompt ? (
              <button
                type="button"
                onClick={handleInstall}
                disabled={installing}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {installing ? t.gate.installing : t.gate.install}
              </button>
            ) : (
              <>
                <Step number={1}>
                  {t.gate.chromeStep1}
                </Step>
                <Step number={2}>
                  {t.gate.chromeStep2}
                </Step>
                <Step number={3}>
                  {t.gate.chromeStep3}
                </Step>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
        {number}
      </span>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  )
}

export function StandaloneGate({ children }: { children: React.ReactNode }) {
  // Default false — always starts with the gate (no null/blank flash, no SSR mismatch)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
    setIsStandalone(standalone)
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent))
  }, [])

  if (!isStandalone) return <InstallGate isIos={isIos} />
  return <>{children}</>
}
