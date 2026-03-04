'use client'

import { GlassCard } from '@/components/dashboard/glass-card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'
import type { Task } from '@/lib/types'
import { cn } from '@/lib/utils'

interface UpcomingTileProps {
  tasks: Task[]
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
}

export function UpcomingTile({ tasks }: UpcomingTileProps) {
  return (
    <GlassCard className="bento-2x1 flex flex-col" hover={false}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-foreground">Nadchodzące</h2>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </div>

      {tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          Brak nadchodzących zadań
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-lg p-2 hover:bg-white/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="text-sm truncate">{task.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', priorityColors[task.priority])}>
                  {task.priority}
                </Badge>
                {task.due_date && (
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {format(parseISO(task.due_date), 'd MMM', { locale: pl })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
