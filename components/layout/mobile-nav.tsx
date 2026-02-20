'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Users, CalendarDays, BookOpen, Settings, CheckSquare } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { Workspace } from '@/lib/types'

interface MobileNavProps {
  workspaces: Workspace[]
  userName: string
  avatarUrl?: string | null
}

const tabs = [
  { href: '/private', label: 'Pulpit', icon: Home },
  { href: '/coworking', label: 'Coworking', icon: Users },
  { href: '/private', label: 'Kalendarz', icon: CalendarDays, query: '?view=month' },
  { href: '/private', label: 'Dziennik', icon: BookOpen, query: '?tab=journal' },
  { href: '/settings', label: 'Ustawienia', icon: Settings },
]

export function MobileNav({ workspaces, userName, avatarUrl }: MobileNavProps) {
  const pathname = usePathname()

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  function isActive(href: string) {
    if (href === '/private') return pathname === '/private'
    if (href === '/coworking') return pathname.startsWith('/coworking')
    if (href === '/settings') return pathname === '/settings'
    return false
  }

  return (
    <>
      {/* Top bar — minimal with avatar */}
      <div className="flex h-12 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-lg px-4 lg:hidden">
        <Link href="/private" className="flex items-center gap-2 font-bold">
          <CheckSquare className="h-5 w-5 text-primary" />
          <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
            TaskFlow
          </span>
        </Link>

        <Avatar className="h-8 w-8 border border-border/50">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <nav
          className="glass-bottom-bar flex items-center justify-around px-1"
          style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
        >
          {tabs.map((tab) => {
            const active = isActive(tab.href)
            const Icon = tab.icon
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 py-2 px-2 text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {active && (
                  <span className="absolute bottom-1 h-0.5 w-5 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
