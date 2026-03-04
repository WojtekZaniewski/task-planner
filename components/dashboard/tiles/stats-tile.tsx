'use client'

import { GlassCard } from '@/components/dashboard/glass-card'

interface StatsTileProps {
  total: number
  done: number
}

export function StatsTile({ total, done }: StatsTileProps) {
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100)
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (percentage / 100) * circumference

  return (
    <GlassCard className="bento-1x1 flex flex-col items-center justify-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{percentage}%</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{done} z {total} ukończonych</p>
    </GlassCard>
  )
}
