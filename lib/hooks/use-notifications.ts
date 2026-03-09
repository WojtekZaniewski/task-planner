'use client'

import { useState, useEffect, useCallback } from 'react'

export interface NotificationPrefs {
  enabled: boolean
  time: string       // "HH:MM"
  lastShown: string  // ISO date "YYYY-MM-DD"
}

const STORAGE_KEY = 'task-planner-notifications'
const SESSION_KEY = 'task-planner-notifications-dismissed'

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function loadPrefs(): NotificationPrefs | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as NotificationPrefs) : null
  } catch {
    return null
  }
}

function savePrefs(prefs: NotificationPrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

export function useNotifications() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null | undefined>(undefined)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const loaded = loadPrefs()
    setPrefs(loaded)
    if ('Notification' in window) setPermission(Notification.permission)

    // Show prompt if never configured and not dismissed this session
    const sessionDismissed = sessionStorage.getItem(SESSION_KEY)
    const notifDenied = 'Notification' in window && Notification.permission === 'denied'
    if (!loaded && !sessionDismissed && !notifDenied) {
      setShowPrompt(true)
    }
  }, [])

  const checkAndNotify = useCallback(() => {
    const p = loadPrefs()
    if (!p?.enabled) return
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    const [h, m] = p.time.split(':').map(Number)
    const now = new Date()
    const diffMinutes = (now.getHours() - h) * 60 + (now.getMinutes() - m)
    const today = getToday()

    if (Math.abs(diffMinutes) <= 10 && p.lastShown !== today) {
      new Notification('tasks', {
        body: 'Czas na sprawdzenie zadań! 🎯',
        icon: '/icons/icon-192x192.png',
      })
      const updated = { ...p, lastShown: today }
      savePrefs(updated)
      setPrefs(updated)
    }
  }, [])

  useEffect(() => {
    checkAndNotify()
  }, [checkAndNotify])

  const enable = useCallback(async (time: string): Promise<boolean> => {
    if (!('Notification' in window)) return false
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result !== 'granted') return false

    const newPrefs: NotificationPrefs = { enabled: true, time, lastShown: '' }
    savePrefs(newPrefs)
    setPrefs(newPrefs)
    setShowPrompt(false)
    return true
  }, [])

  const dismiss = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, '1')
    setShowPrompt(false)
  }, [])

  const disable = useCallback(() => {
    const updated: NotificationPrefs = { enabled: false, time: '09:00', lastShown: '' }
    savePrefs(updated)
    setPrefs(updated)
  }, [])

  return { prefs, permission, showPrompt, enable, dismiss, disable }
}
