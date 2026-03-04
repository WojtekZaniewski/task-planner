'use client'

import { GlassCard } from '@/components/dashboard/glass-card'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'

interface HeroTileProps {
  total: number
  done: number
}

export function HeroTile({ total, done }: HeroTileProps) {
  const today = format(new Date(), "EEEE, d MMMM", { locale: pl })
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100)
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (percentage / 100) * circumference

  return (
    <GlassCard className="bento-hero flex flex-col justify-between" hover={false}>
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
          Twoja<br />
          <span className="text-primary">misja</span>
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 py-6">
        <div className="relative h-40 w-40 sm:h-48 sm:w-48">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-bold text-foreground">{percentage}%</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3">{done} z {total} ukończonych</p>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="h-4 w-4" />
        <span>{today}</span>
      </div>
    </GlassCard>
  )
}
