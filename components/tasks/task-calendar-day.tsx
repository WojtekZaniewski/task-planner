'use client'

import { format, isToday, addDays, subDays } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task } from '@/lib/types'
import { TaskCard } from './task-card'
import { cn } from '@/lib/utils'

interface TaskCalendarDayProps {
  tasks: Task[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: string) => void
  showAssignee?: boolean
}

export function TaskCalendarDay({
  tasks,
  selectedDate,
  onDateChange,
  onEdit,
  onDelete,
  onStatusChange,
  showAssignee = false,
}: TaskCalendarDayProps) {
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const dayTasks = tasks.filter((t) => t.due_date === dateStr)
  const noDateTasks = tasks.filter((t) => !t.due_date)

  // Generate hours for the day view
  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Group tasks by hour
  const tasksByHour: Record<number, Task[]> = {}
  dayTasks.forEach((task) => {
    if (task.due_time) {
      const hour = parseInt(task.due_time.split(':')[0])
      if (!tasksByHour[hour]) tasksByHour[hour] = []
      tasksByHour[hour].push(task)
    }
  })

  const tasksWithoutTime = dayTasks.filter((t) => !t.due_time)

  return (
    <div className="space-y-4">
      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDateChange(subDays(selectedDate, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <h3
            className={cn(
              'text-lg font-semibold',
              isToday(selectedDate) && 'text-primary'
            )}
          >
            {format(selectedDate, 'EEEE', { locale: pl })}
          </h3>
          <p className="text-sm text-muted-foreground">
            {format(selectedDate, 'd MMMM yyyy', { locale: pl })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDateChange(addDays(selectedDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Tasks without time */}
      {tasksWithoutTime.length > 0 && (
        <div className="rounded-lg border p-3">
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            Cały dzień ({tasksWithoutTime.length})
          </h4>
          <div className="space-y-2">
            {tasksWithoutTime.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                showAssignee={showAssignee}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="rounded-lg border">
        {hours.map((hour) => {
          const hourTasks = tasksByHour[hour] || []
          const timeStr = `${hour.toString().padStart(2, '0')}:00`

          return (
            <div
              key={hour}
              className={cn(
                'flex min-h-[48px] border-b last:border-b-0',
                hourTasks.length > 0 && 'bg-primary/5'
              )}
            >
              <div className="flex w-16 shrink-0 items-start justify-end border-r p-2">
                <span className="text-xs text-muted-foreground">{timeStr}</span>
              </div>
              <div className="flex-1 p-1">
                {hourTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    showAssignee={showAssignee}
                    compact
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* No-date tasks */}
      {noDateTasks.length > 0 && (
        <div className="rounded-lg border border-dashed p-3">
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            Bez daty ({noDateTasks.length})
          </h4>
          <div className="space-y-2">
            {noDateTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                showAssignee={showAssignee}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
