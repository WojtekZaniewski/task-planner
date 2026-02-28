'use client'

import type { BrandValidationResult } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ValidationResultsProps {
  result: BrandValidationResult
}

export function ValidationResults({ result }: ValidationResultsProps) {
  const scoreColor =
    result.score >= 80
      ? 'text-green-500'
      : result.score >= 50
        ? 'text-yellow-500'
        : 'text-red-500'

  return (
    <div className="glow-card glow-purple rounded-2xl border border-border/50 p-5 bg-card dark:glass-card space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-light text-muted-foreground">Wynik zgodnosci</p>
          <p className={cn('text-5xl font-bold tracking-tight', scoreColor)}>
            {result.score}
            <span className="text-lg font-normal text-muted-foreground">/100</span>
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-lg border px-3 py-1 text-sm font-semibold',
            result.passed
              ? 'border-green-500/30 bg-green-500/10 text-green-500'
              : 'border-red-500/30 bg-red-500/10 text-red-500',
          )}
        >
          {result.passed ? 'Zaliczony' : 'Niezaliczony'}
        </span>
      </div>

      {result.violations.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-red-500">Naruszenia</h3>
          <ul className="space-y-1">
            {result.violations.map((violation, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                <span>{violation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.warnings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-amber-500">Ostrzezenia</h3>
          <ul className="space-y-1">
            {result.warnings.map((warning, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-yellow-500" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.suggestions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-green-500">Sugestie</h3>
          <ul className="space-y-1">
            {result.suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
