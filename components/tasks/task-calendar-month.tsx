'use client'

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { pl } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Task } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TaskCalendarMonthProps {
  tasks: Task[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  onDayClick: (date: Date) => void
  showAssignee?: boolean
}

const priorityDotColors: Record<string, string> = {
  low: 'bg-gray-400',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
}

export function TaskCalendarMonth({
  tasks,
  selectedDate,
  onDateChange,
  onDayClick,
}: TaskCalendarMonthProps) {
  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekDays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDateChange(subMonths(selectedDate, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold capitalize">
          {format(selectedDate, 'LLLL yyyy', { locale: pl })}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDateChange(addMonths(selectedDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayTasks = tasks.filter((t) => t.due_date === dateStr)
            const isCurrentMonth = isSameMonth(day, selectedDate)

            return (
              <button
                key={dateStr}
                onClick={() => onDayClick(day)}
                className={cn(
                  'flex min-h-[80px] flex-col border-b border-r p-1.5 text-left transition-colors hover:bg-accent/50',
                  !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
                  isToday(day) && 'bg-primary/10 ring-1 ring-primary/20'
                )}
              >
                <span
                  className={cn(
                    'mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                    isToday(day) && 'bg-primary text-primary-foreground font-bold'
                  )}
                >
                  {format(day, 'd')}
                </span>

                {/* Task dots */}
                <div className="flex flex-wrap gap-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        priorityDotColors[task.priority]
                      )}
                      title={task.title}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>

                {/* Task titles (desktop) */}
                <div className="hidden sm:block mt-0.5 space-y-0.5">
                  {dayTasks.slice(0, 2).map((task) => (
                    <p
                      key={task.id}
                      className={cn(
                        'truncate text-[10px] leading-tight',
                        task.status === 'done' && 'line-through text-muted-foreground'
                      )}
                    >
                      {task.title}
                    </p>
                  ))}
                  {dayTasks.length > 2 && (
                    <p className="text-[10px] text-muted-foreground">
                      +{dayTasks.length - 2} więcej
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
