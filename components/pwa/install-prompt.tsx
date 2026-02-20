'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem('pwa-dismissed')) {
      setDismissed(true)
      return
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  // Don't show if already installed (standalone mode)
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setDismissed(true)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
    setDismissed(true)
  }

  function handleDismiss() {
    setDismissed(true)
    sessionStorage.setItem('pwa-dismissed', 'true')
  }

  if (!deferredPrompt || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-[360px]">
      <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-lg">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Aplikacja dostępna</p>
          <p className="text-xs text-muted-foreground">
            Zainstaluj TaskFlow na swoim urządzeniu
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
