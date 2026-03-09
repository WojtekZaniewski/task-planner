'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Share, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [iosDismissed, setIosDismissed] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)

    if (standalone) {
      setDismissed(true)
      setIosDismissed(true)
      return
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIos(ios)

    if (ios) {
      setIosDismissed(!!sessionStorage.getItem('pwa-ios-dismissed'))
      return
    }

    if (sessionStorage.getItem('pwa-dismissed')) {
      setDismissed(true)
      return
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDeferredPrompt(null)
    setDismissed(true)
  }

  function handleDismiss() {
    setDismissed(true)
    sessionStorage.setItem('pwa-dismissed', 'true')
  }

  function handleIosDismiss() {
    setIosDismissed(true)
    sessionStorage.setItem('pwa-ios-dismissed', '1')
  }

  // iOS guidance
  if (isIos && !iosDismissed) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-[360px]">
        <div className="glass-strong rounded-bento p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Share className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Dodaj do ekranu głównego</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kliknij <Share className="inline h-3 w-3 mx-0.5" /> w pasku Safari, a następnie „Dodaj do ekranu głównego"
              </p>
            </div>
            <button
              type="button"
              onClick={handleIosDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
              aria-label="Zamknij"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Chrome/Edge prompt
  if (!deferredPrompt || dismissed) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-[360px]">
      <div className="glass-strong flex items-center gap-3 rounded-bento p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Aplikacja dostępna</p>
          <p className="text-xs text-muted-foreground">
            Zainstaluj tasks na swoim urządzeniu
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" onClick={handleInstall}>
            Instaluj
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
