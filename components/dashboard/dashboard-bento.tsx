'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CheckSquare, Settings } from 'lucide-react'
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
    label: 'zadania',
    icon: CheckSquare,
    glow: 'glow-orange',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
    href: '/private/tasks',
  },
  {
    key: 'profile',
    label: 'konto',
    icon: Settings,
    glow: 'glow-orange',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
    href: '/settings',
  },
] as const

export function DashboardBento({
  firstName,
  avatarUrl,
  initials,
  todoCount,
}: DashboardBentoProps) {
  const today = format(new Date(), "EEEE, d MMMM", { locale: pl })

  function getDescription(key: string) {
    switch (key) {
      case 'private':
        return todoCount === 0
          ? 'wszystko zrobione!'
          : `${todoCount} ${todoCount === 1 ? 'zadanie' : todoCount < 5 ? 'zadania' : 'zadań'} do zrobienia`
      case 'profile':
        return 'ustawienia konta'
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
          <h1 className="text-2xl sm:text-3xl font-display tracking-tight">
            cześć, {firstName}
          </h1>
          <p className="text-sm font-light text-muted-foreground">
            {today}
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-3">
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
