'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ThemePreference } from '@/lib/types'

interface ThemeContextType {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function applyTheme(theme: ThemePreference) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: {
  children: React.ReactNode
  defaultTheme?: ThemePreference
}) {
  const [theme, setThemeState] = useState<ThemePreference>(defaultTheme)

  function setTheme(newTheme: ThemePreference) {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  useEffect(() => {
    const stored = localStorage.getItem('theme') as ThemePreference | null
    const initial = stored || defaultTheme
    setThemeState(initial)
    applyTheme(initial)

    // Listen for system theme changes
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    function handleChange() {
      if ((stored || defaultTheme) === 'system') {
        applyTheme('system')
      }
    }
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [defaultTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
