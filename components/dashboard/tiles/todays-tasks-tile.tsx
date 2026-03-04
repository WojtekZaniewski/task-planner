'use client'

import { GlassCard } from '@/components/dashboard/glass-card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import type { Task, TaskStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TodaysTasksTileProps {
  tasks: Task[]
  onStatusChange: (taskId: string, status: TaskStatus) => void
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
}

export function TodaysTasksTile({ tasks, onStatusChange }: TodaysTasksTileProps) {
  return (
    <GlassCard className="bento-wide flex flex-col" hover={false}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-foreground">Dzisiejsze zadania</h2>
        <span className="text-xs text-muted-foreground">{tasks.length} zadań</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 -mx-1 px-1">
        {tasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground h-full">
            Brak zadań na dziś
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-white/40',
                task.status === 'done' && 'opacity-50'
              )}
            >
              <Checkbox
                checked={task.status === 'done'}
                onCheckedChange={(checked) =>
                  onStatusChange(task.id, checked ? 'done' : 'todo')
                }
                className="border-primary data-[state=checked]:bg-primary shrink-0"
              />
              <p className={cn(
                'text-sm flex-1 truncate',
                task.status === 'done' && 'line-through text-muted-foreground'
              )}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', priorityColors[task.priority])}>
                  {task.priority}
                </Badge>
                {task.due_time && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {task.due_time}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  )
}
