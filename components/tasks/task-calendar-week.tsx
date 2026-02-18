'use client'

import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  addWeeks,
  subWeeks,
} from 'date-fns'
import { pl } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task } from '@/lib/types'
import { TaskCard } from './task-card'
import { cn } from '@/lib/utils'

interface TaskCalendarWeekProps {
  tasks: Task[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: string) => void
  showAssignee?: boolean
}

export function TaskCalendarWeek({
  tasks,
  selectedDate,
  onDateChange,
  onEdit,
  onDelete,
  onStatusChange,
  showAssignee = false,
}: TaskCalendarWeekProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDateChange(subWeeks(selectedDate, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {format(weekStart, 'd MMM', { locale: pl })} –{' '}
          {format(weekEnd, 'd MMM yyyy', { locale: pl })}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDateChange(addWeeks(selectedDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayTasks = tasks.filter((t) => t.due_date === dateStr)

          return (
            <div
              key={dateStr}
              className={cn(
                'rounded-lg border p-2',
                isToday(day) && 'border-primary bg-primary/5'
              )}
            >
              <div className="mb-2 text-center">
                <p className="text-xs text-muted-foreground">
                  {format(day, 'EEE', { locale: pl })}
                </p>
                <p
                  className={cn(
                    'text-lg font-semibold',
                    isToday(day) && 'text-primary'
                  )}
                >
                  {format(day, 'd')}
                </p>
              </div>

              <div className="space-y-1.5 min-h-[60px]">
                {dayTasks.map((task) => (
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
    </div>
  )
}
