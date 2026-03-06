'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/hooks/use-theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label="Przełącz tryb ciemny"
      onClick={toggleTheme}
      className="fixed top-3 right-3 z-50 glass-button flex h-9 w-9 items-center justify-center rounded-full transition-all"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-foreground" />
      )}
    </button>
  )
}
