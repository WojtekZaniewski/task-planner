'use client'

import { GlassCard } from '@/components/dashboard/glass-card'
import type { Task } from '@/lib/types'

interface CategoriesTileProps {
  tasks: Task[]
}

const priorities = [
  { key: 'urgent', label: 'Pilne', color: 'bg-red-500' },
  { key: 'high', label: 'Wysokie', color: 'bg-orange-500' },
  { key: 'medium', label: 'Średnie', color: 'bg-amber-400' },
  { key: 'low', label: 'Niskie', color: 'bg-slate-300' },
] as const

export function CategoriesTile({ tasks }: CategoriesTileProps) {
  const activeTasks = tasks.filter(t => t.status !== 'done')
  const counts = Object.fromEntries(
    priorities.map(p => [p.key, activeTasks.filter(t => t.priority === p.key).length])
  )
  const maxCount = Math.max(...Object.values(counts), 1)

  return (
    <GlassCard className="bento-1x1 flex flex-col">
      <h2 className="font-semibold text-foreground text-sm mb-3">Priorytety</h2>
      <div className="flex-1 flex flex-col justify-center gap-2.5">
        {priorities.map((p) => (
          <div key={p.key} className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${p.color} shrink-0`} />
            <span className="text-xs text-muted-foreground w-14 shrink-0">{p.label}</span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${p.color} transition-all duration-500`}
                style={{ width: `${(counts[p.key] / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium w-4 text-right">{counts[p.key]}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
