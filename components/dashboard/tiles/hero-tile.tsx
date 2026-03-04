'use client'

import { GlassCard } from '@/components/dashboard/glass-card'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'

interface HeroTileProps {
  todoCount: number
  doneToday: number
}

export function HeroTile({ todoCount, doneToday }: HeroTileProps) {
  const today = format(new Date(), "EEEE, d MMMM", { locale: pl })

  return (
    <GlassCard className="bento-2x2 flex flex-col justify-between" hover={false}>
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <CalendarDays className="h-4 w-4" />
          <span>{today}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
          Twoje<br />
          <span className="text-primary">zadania</span>
        </h1>
      </div>

      <div className="flex items-end gap-6">
        <div>
          <p className="text-5xl font-bold text-foreground">{todoCount}</p>
          <p className="text-sm text-muted-foreground mt-1">do zrobienia</p>
        </div>
        {doneToday > 0 && (
          <div>
            <p className="text-3xl font-bold text-primary">{doneToday}</p>
            <p className="text-sm text-muted-foreground mt-1">zrobione dziś</p>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
