'use client'

import { X } from 'lucide-react'
import type { Task, TaskStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TaskTileProps {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onDelete: (taskId: string) => void
}

export function TaskTile({ task, onStatusChange, onDelete }: TaskTileProps) {
  const isDone = task.status === 'done'

  function handleClick() {
    onStatusChange(task.id, isDone ? 'todo' : 'done')
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    onDelete(task.id)
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'bento-task task-tile glass rounded-bento px-5 py-4 cursor-pointer select-none relative',
        'flex flex-col items-center justify-center text-center',
        isDone && 'task-done'
      )}
    >
      <button
        type="button"
        aria-label="Usuń zadanie"
        onClick={handleDelete}
        className={cn(
          'absolute top-2 right-3 p-1 rounded-full transition-colors',
          isDone ? 'text-white/60 hover:text-white' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <p className={cn(
        'text-sm font-medium leading-snug',
        isDone ? 'text-white' : 'text-foreground'
      )}>
        {task.title}
      </p>
      {task.description && (
        <p className={cn(
          'text-xs mt-0.5',
          isDone ? 'text-white/60' : 'text-muted-foreground'
        )}>
          {task.description}
        </p>
      )}
    </div>
  )
}
