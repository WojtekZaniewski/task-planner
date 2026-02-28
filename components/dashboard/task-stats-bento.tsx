'use client'

import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, ListTodo, BarChart3 } from 'lucide-react'

interface TaskStatsBentoProps {
  todo: number
  inProgress: number
  done: number
  total: number
}

const stats = [
  {
    key: 'done',
    label: 'zrobione',
    icon: CheckCircle2,
    glow: 'glow-orange',
    iconColor: 'text-orange-500',
    numberColor: 'text-orange-500',
    large: true,
  },
  {
    key: 'in_progress',
    label: 'w trakcie',
    icon: Clock,
    glow: 'glow-orange',
    iconColor: 'text-orange-500',
    numberColor: 'text-orange-500',
    large: false,
  },
  {
    key: 'todo',
    label: 'do zrobienia',
    icon: ListTodo,
    glow: 'glow-orange',
    iconColor: 'text-orange-500',
    numberColor: 'text-primary',
    large: false,
  },
  {
    key: 'total',
    label: 'wszystkie',
    icon: BarChart3,
    glow: 'glow-orange',
    iconColor: 'text-orange-500',
    numberColor: '',
    large: false,
  },
] as const

export function TaskStatsBento({ todo, inProgress, done, total }: TaskStatsBentoProps) {
  const values: Record<string, number> = {
    done,
    in_progress: inProgress,
    todo,
    total,
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className={cn(
            'glow-card rounded-2xl border border-border/50 p-5',
            'bg-card dark:glass-card',
            stat.glow,
            stat.large && 'sm:col-span-2'
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className={cn('h-4 w-4', stat.iconColor)} />
            <span className="text-xs text-muted-foreground font-display tracking-wider">
              {stat.label}
            </span>
          </div>
          <p className={cn(
            'font-display tracking-tight',
            stat.large ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl',
            stat.numberColor
          )}>
            {values[stat.key]}
          </p>
        </div>
      ))}
    </div>
  )
}
