'use client'

import { GlassCard } from '@/components/dashboard/glass-card'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2 } from 'lucide-react'
import type { Task, TaskStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TaskTileProps {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onDelete: (taskId: string) => void
}

export function TaskTile({ task, onStatusChange, onDelete }: TaskTileProps) {
  const isDone = task.status === 'done'

  return (
    <GlassCard className={cn('bento-1x1 flex flex-col justify-between group', isDone && 'opacity-50')}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isDone}
          onCheckedChange={(checked) =>
            onStatusChange(task.id, checked ? 'done' : 'todo')
          }
          className="mt-1 border-primary data-[state=checked]:bg-primary shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium leading-snug',
            isDone && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          aria-label="Usuń zadanie"
          onClick={() => onDelete(task.id)}
          className="glass-button flex h-7 w-7 items-center justify-center rounded-full"
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </GlassCard>
  )
}
