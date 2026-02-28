'use client'

import { cn } from '@/lib/utils'

interface SensitivityTableProps {
  table: {
    row_label: string
    col_label: string
    row_values: number[]
    col_values: number[]
    values: number[][]
  }
  baseEV: number
}

function formatPercent(v: number): string {
  return (v * 100).toFixed(1) + '%'
}

function formatCurrency(v: number): string {
  if (Math.abs(v) >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K'
  return '$' + v.toFixed(0)
}

export function SensitivityTable({ table, baseEV }: SensitivityTableProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold tracking-tight">Analiza wrazliwosci</h3>
      <p className="text-sm text-muted-foreground">
        {table.row_label} vs {table.col_label} &mdash; wartosci przedsiebiorstwa
      </p>
      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card dark:glass-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                {table.row_label} \ {table.col_label}
              </th>
              {table.col_values.map((col) => (
                <th
                  key={col}
                  className="px-3 py-3 text-center font-medium text-muted-foreground whitespace-nowrap"
                >
                  {formatPercent(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.row_values.map((row, ri) => (
              <tr key={row} className="border-b border-border/30 last:border-0">
                <td className="px-3 py-3 font-medium text-muted-foreground whitespace-nowrap">
                  {formatPercent(row)}
                </td>
                {table.col_values.map((col, ci) => {
                  const val = table.values[ri][ci]
                  const diff = val - baseEV
                  const isBase =
                    ri === Math.floor(table.row_values.length / 2) &&
                    ci === Math.floor(table.col_values.length / 2)

                  return (
                    <td
                      key={`${row}-${col}`}
                      className={cn(
                        'px-3 py-3 text-center tabular-nums whitespace-nowrap',
                        isBase && 'font-bold ring-2 ring-primary/50 rounded-lg',
                        !isBase && diff > 0 && 'bg-green-500/10 text-green-700 dark:text-green-400',
                        !isBase && diff < 0 && 'bg-red-500/10 text-red-700 dark:text-red-400',
                      )}
                    >
                      {formatCurrency(val)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
