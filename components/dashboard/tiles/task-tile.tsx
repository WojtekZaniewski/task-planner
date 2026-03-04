'use client'

import { Check } from 'lucide-react'
import type { Task, TaskStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TaskTileProps {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
}

export function TaskTile({ task, onStatusChange }: TaskTileProps) {
  const isDone = task.status === 'done'

  function handleClick() {
    onStatusChange(task.id, isDone ? 'todo' : 'done')
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'bento-task task-tile glass rounded-bento px-5 py-4 cursor-pointer select-none',
        'flex items-center gap-4',
        isDone && 'task-done'
      )}
    >
      <div className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2',
        isDone
          ? 'border-white bg-white/20'
          : 'border-primary/30 bg-transparent'
      )}>
        {isDone && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium leading-snug',
          isDone ? 'text-white' : 'text-foreground'
        )}>
          {task.title}
        </p>
        {task.description && (
          <p className={cn(
            'text-xs mt-0.5 truncate',
            isDone ? 'text-white/60' : 'text-muted-foreground'
          )}>
            {task.description}
          </p>
        )}
      </div>
    </div>
  )
}
