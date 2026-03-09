'use client'

import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { useNotifications } from '@/lib/hooks/use-notifications'
import { useTranslations } from '@/lib/i18n'

export function NotificationSetup() {
  const { showPrompt, enable, dismiss } = useNotifications()
  const t = useTranslations()
  const [time, setTime] = useState('09:00')
  const [loading, setLoading] = useState(false)
  const [denied, setDenied] = useState(false)

  if (!showPrompt) return null

  async function handleEnable() {
    setLoading(true)
    const granted = await enable(time)
    setLoading(false)
    if (!granted) setDenied(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 pointer-events-none">
      <div className="glass rounded-2xl p-5 w-full max-w-sm shadow-xl pointer-events-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">{t.notifications.title}</h2>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg"
            aria-label={t.notifications.close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          {t.notifications.description}
        </p>

        {denied ? (
          <p className="text-xs text-destructive mb-4">
            {t.notifications.denied}
          </p>
        ) : (
          <div className="flex items-center gap-3 mb-4">
            <label className="text-xs text-muted-foreground shrink-0">{t.notifications.timeLabel}</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="glass rounded-lg px-3 py-1.5 text-sm text-foreground w-full focus:outline-none"
            />
          </div>
        )}

        <div className="flex gap-2">
          {!denied && (
            <button
              type="button"
              onClick={handleEnable}
              disabled={loading}
              className="flex-1 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? t.notifications.enabling : t.notifications.enable}
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className="glass-button rounded-xl px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.notifications.notNow}
          </button>
        </div>
      </div>
    </div>
  )
}
