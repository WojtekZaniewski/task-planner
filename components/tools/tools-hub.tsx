'use client'

import Link from 'next/link'
import { Calculator, Palette, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const tools = [
  {
    key: 'financial-ratios',
    label: 'Kalkulator wskaznikow',
    description: 'Oblicz i interpretuj kluczowe wskazniki finansowe',
    icon: Calculator,
    glow: 'glow-orange',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
    href: '/private/tools/financial-ratios',
  },
  {
    key: 'brand-validator',
    label: 'Walidator marki',
    description: 'Sprawdz zgodnosc tresci z wytycznymi marki',
    icon: Palette,
    glow: 'glow-purple',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
    href: '/private/tools/brand-validator',
  },
  {
    key: 'dcf-model',
    label: 'Model DCF',
    description: 'Wycena przedsiebiorstw metoda zdyskontowanych przeplywow',
    icon: TrendingUp,
    glow: 'glow-teal',
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-500',
    href: '/private/tools/dcf-model',
  },
] as const

export function ToolsHub() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Narzedzia</h1>
        <p className="text-sm font-light text-muted-foreground mt-1">
          Analizy finansowe i walidacja marki
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link
              key={tool.key}
              href={tool.href}
              className={cn(
                'glow-card rounded-2xl border border-border/50 p-5 bg-card dark:glass-card',
                'transition-transform hover:scale-[1.02] cursor-pointer',
                tool.glow,
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl mb-3',
                  tool.iconBg,
                )}
              >
                <Icon className={cn('h-5 w-5', tool.iconColor)} />
              </div>
              <h3 className="text-sm font-medium mb-1">{tool.label}</h3>
              <p className="text-xs font-light text-muted-foreground line-clamp-2">
                {tool.description}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
