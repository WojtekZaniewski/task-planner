'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Writes the Supabase access token to native App Group UserDefaults
// so the iOS WidgetKit extension can read it.
// Only activates when running inside the Capacitor native shell.
export function CapacitorTokenBridge() {
  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const cap = (window as unknown as { Capacitor?: { isNativePlatform: () => boolean; Plugins: Record<string, unknown> } }).Capacitor
      if (!cap?.isNativePlatform()) return

      const bridge = cap.Plugins.TokenBridge as { setToken?: (args: { token: string }) => void } | undefined
      bridge?.setToken({ token: session?.access_token ?? '' })
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}
