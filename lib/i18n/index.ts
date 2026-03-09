'use client'

import { useState, useEffect } from 'react'
import { translations } from './translations'

export type { Translations } from './translations'

// Non-reactive — use inside async callbacks in hooks
export function getT() {
  if (typeof window === 'undefined') return translations.en
  return navigator.language?.startsWith('pl') ? translations.pl : translations.en
}

// Reactive hook — use in React components and hooks
export function useTranslations() {
  const [t, setT] = useState(translations.en)
  useEffect(() => {
    setT(navigator.language?.startsWith('pl') ? translations.pl : translations.en)
  }, [])
  return t
}
