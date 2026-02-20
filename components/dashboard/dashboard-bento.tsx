'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CheckSquare, Users, BookOpen, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface DashboardBentoProps {
  firstName: string
  avatarUrl: string | null
  initials: string
  todoCount: number
  workspaceCount: number
}

const tiles = [
  {
    key: 'private',
    label: 'Sekcja prywatna',
    icon: CheckSquare,
    glow: 'glow-orange',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
    href: '/private',
  },
  {
    key: 'workspace',
    label: 'Workspace',
    icon: Users,
    glow: 'glow-blue',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    href: '/coworking',
  },
  {
    key: 'notebook',
    label: 'Notatnik',
    icon: BookOpen,
    glow: 'glow-green',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
    href: '/private',
  },
  {
    key: 'profile',
    label: 'Profil',
    icon: Settings,
    glow: 'glow-purple',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
    href: '/settings',
  },
] as const

export function DashboardBento({
  firstName,
  avatarUrl,
  initials,
  todoCount,
  workspaceCount,
}: DashboardBentoProps) {
  const [lastEntry, setLastEntry] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchLastEntry() {
      const { data } = await supabase
        .from('journal_entries')
        .select('content')
        .is('workspace_id', null)
        .order('created_at', { ascending: false })
        .limit(1)

      if (data && data.length > 0) {
        setLastEntry(data[0].content)
      }
    }
    fetchLastEntry()
  }, [supabase])

  const today = format(new Date(), "EEEE, d MMMM", { locale: pl })

  function getDescription(key: string) {
    switch (key) {
      case 'private':
        return todoCount === 0
          ? 'Wszystko zrobione!'
          : `${todoCount} ${todoCount === 1 ? 'zadanie' : todoCount < 5 ? 'zadania' : 'zadań'} do zrobienia`
      case 'workspace':
        return workspaceCount === 0
          ? 'Utwórz pierwszy workspace'
          : `${workspaceCount} ${workspaceCount === 1 ? 'workspace' : 'workspace\'ów'}`
      case 'notebook':
        return lastEntry || 'Brak wpisów — zacznij pisać!'
      case 'profile':
        return 'Ustawienia konta'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={firstName} />}
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Cześć, {firstName}
          </h1>
          <p className="text-sm font-light text-muted-foreground capitalize">
            {today}
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => {
          const Icon = tile.icon
          return (
            <Link
              key={tile.key}
              href={tile.href}
              className={cn(
                'glow-card rounded-2xl border border-border/50 p-5 bg-card dark:glass-card',
                'transition-transform hover:scale-[1.02] cursor-pointer',
                tile.glow
              )}
            >
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl mb-3',
                tile.iconBg
              )}>
                <Icon className={cn('h-5 w-5', tile.iconColor)} />
              </div>
              <h3 className="text-sm font-medium mb-1">{tile.label}</h3>
              <p className="text-xs font-light text-muted-foreground line-clamp-2">
                {getDescription(tile.key)}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
