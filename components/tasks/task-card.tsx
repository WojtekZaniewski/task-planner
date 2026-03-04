'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Trash2, Pencil } from 'lucide-react'
import type { Task, TaskStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
}

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const isDone = task.status === 'done'

  return (
    <div className={cn(
      'glass rounded-lg p-4 transition-all duration-200 group',
      'glass-hover glow-orange',
      isDone && 'opacity-60'
    )}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isDone}
          onCheckedChange={(checked) =>
            onStatusChange(task.id, checked ? 'done' : 'todo')
          }
          className="mt-1 border-primary data-[state=checked]:bg-primary"
        />
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium', isDone && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', priorityColors[task.priority])}>
              {task.priority}
            </Badge>
            {task.status === 'in_progress' && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-700">
                w trakcie
              </Badge>
            )}
            {task.due_date && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(parseISO(task.due_date), 'd MMM', { locale: pl })}
                {task.due_time && ` ${task.due_time}`}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(task)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(task.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
