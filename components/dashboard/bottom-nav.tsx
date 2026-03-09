'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Sun, Moon, BookOpen } from 'lucide-react'
import { useTheme } from '@/lib/hooks/use-theme'
import { useTranslations } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const t = useTranslations()

  const isHome = pathname === '/dashboard' || pathname === '/'
  const isJournal = pathname === '/journal'

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 glass rounded-full px-2 py-2 flex items-center gap-1">
      <button
        type="button"
        aria-label="Dashboard"
        onClick={() => router.push('/dashboard')}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300',
          isHome
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Home className="h-4.5 w-4.5" />
      </button>

      <button
        type="button"
        aria-label={t.nav.toggleDark}
        onClick={toggleTheme}
        className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-all duration-300"
      >
        {theme === 'dark' ? (
          <Sun className="h-4.5 w-4.5" />
        ) : (
          <Moon className="h-4.5 w-4.5" />
        )}
      </button>

      <button
        type="button"
        aria-label={t.nav.journal}
        onClick={() => router.push('/journal')}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300',
          isJournal
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <BookOpen className="h-4.5 w-4.5" />
      </button>
    </nav>
  )
}
