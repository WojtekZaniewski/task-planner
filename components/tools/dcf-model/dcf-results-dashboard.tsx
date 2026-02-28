'use client'

import type { DCFResult } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DCFResultsDashboardProps {
  result: DCFResult
}

function formatValue(v: number): string {
  if (Math.abs(v) >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K'
  return '$' + v.toFixed(0)
}

function formatPercent(v: number): string {
  return (v * 100).toFixed(2) + '%'
}

export function DCFResultsDashboard({ result }: DCFResultsDashboardProps) {
  const pvFCFPercent = (result.pv_fcf / result.enterprise_value) * 100
  const pvTerminalPercent = (result.pv_terminal / result.enterprise_value) * 100

  const stats = [
    {
      label: 'WACC',
      value: formatPercent(result.wacc),
      glow: 'glow-blue',
    },
    {
      label: 'Wartosc przedsiebiorstwa',
      value: formatValue(result.enterprise_value),
      glow: 'glow-teal',
    },
    {
      label: 'Wartosc kapitalu',
      value: formatValue(result.equity_value),
      glow: 'glow-green',
    },
    {
      label: 'Wartosc na akcje',
      value: formatValue(result.per_share_value),
      glow: 'glow-orange',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Key metrics */}
      <div>
        <h3 className="text-lg font-semibold tracking-tight mb-4">
          Wyniki wyceny &mdash; {result.company_name}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                'glow-card rounded-2xl border border-border/50 p-4 bg-card dark:glass-card',
                stat.glow,
              )}
            >
              <p className="text-xs font-light text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-xl font-semibold tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cash flow projections table */}
      <div>
        <h3 className="text-lg font-semibold tracking-tight mb-4">Projekcje przeplywow</h3>
        <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card dark:glass-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rok</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Przychody
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">EBITDA</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">FCF</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">PV</th>
              </tr>
            </thead>
            <tbody>
              {result.projections.map((p) => (
                <tr key={p.year} className="border-b border-border/30 last:border-0">
                  <td className="px-4 py-3 font-medium">{p.year}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatValue(p.revenue)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatValue(p.ebitda)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatValue(p.free_cash_flow)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatValue(p.present_value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminal value breakdown */}
      <div>
        <h3 className="text-lg font-semibold tracking-tight mb-4">Rozklad wartosci</h3>
        <div className="rounded-2xl border border-border/50 bg-card dark:glass-card p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">PV przeplywow (FCF)</span>
              <span className="font-medium tabular-nums">
                {formatValue(result.pv_fcf)} ({pvFCFPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{ width: `${pvFCFPercent}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">PV wartosci terminalnej</span>
              <span className="font-medium tabular-nums">
                {formatValue(result.pv_terminal)} ({pvTerminalPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{ width: `${pvTerminalPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
