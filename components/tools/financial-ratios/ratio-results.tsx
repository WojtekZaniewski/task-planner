'use client'

import type { RatioCategory, RatioResult } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface RatioResultsProps {
  categories: RatioCategory[]
  summary: string
}

const ratingStyles: Record<string, string> = {
  excellent: 'bg-green-500/10 text-green-600',
  good: 'bg-blue-500/10 text-blue-600',
  acceptable: 'bg-yellow-500/10 text-yellow-600',
  poor: 'bg-red-500/10 text-red-600',
}

const ratingLabels: Record<string, string> = {
  excellent: 'Doskonaly',
  good: 'Dobry',
  acceptable: 'Akceptowalny',
  poor: 'Slaby',
}

function RatioCard({ ratio }: { ratio: RatioResult }) {
  return (
    <div className="rounded-xl border border-border/30 p-4 bg-background/50 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {ratio.name}
        </span>
        <Badge
          variant="outline"
          className={cn('border-0 text-xs', ratingStyles[ratio.rating])}
        >
          {ratingLabels[ratio.rating]}
        </Badge>
      </div>
      <p className="text-2xl font-semibold tracking-tight">{ratio.formatted}</p>
      {ratio.interpretation && (
        <p className="text-xs font-light text-muted-foreground">
          {ratio.interpretation}
        </p>
      )}
    </div>
  )
}

export function RatioResults({ categories, summary }: RatioResultsProps) {
  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="glow-card rounded-2xl border border-border/50 p-5 bg-card dark:glass-card">
        <h3 className="text-sm font-medium mb-2">Podsumowanie</h3>
        <p className="text-sm font-light text-muted-foreground">{summary}</p>
      </div>

      {/* Categories */}
      {categories.map((category) => (
        <div
          key={category.name}
          className="glow-card rounded-2xl border border-border/50 p-5 bg-card dark:glass-card"
        >
          <h3 className="text-sm font-medium mb-4">{category.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {category.ratios.map((ratio) => (
              <RatioCard key={ratio.name} ratio={ratio} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
