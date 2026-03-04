'use client'

import { Zap } from 'lucide-react'
import type { Task } from '@/lib/types'

interface FeaturedTileProps {
  task: Task | null
}

export function FeaturedTile({ task }: FeaturedTileProps) {
  return (
    <div className="bento-1x1 flex flex-col justify-between rounded-bento bg-primary p-5 text-white shadow-lg shadow-primary/20">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4" />
        <span className="text-sm font-medium opacity-90">Następne</span>
      </div>

      <div className="flex-1 flex items-center">
        {task ? (
          <p className="text-lg sm:text-xl font-bold leading-snug">
            {task.title}
          </p>
        ) : (
          <p className="text-sm opacity-75">Brak zadań do zrobienia</p>
        )}
      </div>

      {task?.due_time && (
        <p className="text-sm opacity-75">{task.due_time}</p>
      )}
    </div>
  )
}
