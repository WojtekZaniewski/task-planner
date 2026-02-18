'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { List, Columns3, CalendarDays, CalendarRange, Calendar } from 'lucide-react'
import type { CalendarView } from '@/lib/types'

const views: { value: CalendarView; label: string; icon: React.ElementType }[] = [
  { value: 'list', label: 'Lista', icon: List },
  { value: 'kanban', label: 'Kanban', icon: Columns3 },
  { value: 'day', label: 'Dzień', icon: CalendarDays },
  { value: 'week', label: 'Tydzień', icon: CalendarRange },
  { value: 'month', label: 'Miesiąc', icon: Calendar },
]

interface ViewSwitcherProps {
  currentView: CalendarView
  onViewChange: (view: CalendarView) => void
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
      {views.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          onClick={() => onViewChange(value)}
          className={cn(
            'h-8 gap-1.5 text-xs',
            currentView === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  )
}
