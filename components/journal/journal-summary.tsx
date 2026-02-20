'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, TrendingUp, StickyNote, BookOpen, Flame } from 'lucide-react'
import type { JournalEntry } from '@/lib/types'

export function JournalSummary() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchWeekEntries = useCallback(async () => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .is('workspace_id', null)
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: false })

    if (!error) {
      setEntries(data ?? [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchWeekEntries()
  }, [fetchWeekEntries])

  if (loading) return null

  const achievedGoals = entries.filter((e) => e.type === 'achieved_goal')
  const improvements = entries.filter((e) => e.type === 'improvement')
  const notes = entries.filter((e) => e.type === 'note')

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Brak wpisów w tym tygodniu — przejdź do Dziennika i zacznij zapisywać postępy!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:grid-rows-2">
      {/* Osiągnięte cele — large card spanning 2 rows */}
      <div className="sm:row-span-2 rounded-2xl border border-border/50 bg-card p-5 dark:glass-card glass-card-light">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-500/10">
            <Trophy className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Osiągnięte cele</h3>
            {achievedGoals.length > 0 && (
              <p className="text-xs text-muted-foreground">{achievedGoals.length} w tym tygodniu</p>
            )}
          </div>
        </div>
        {achievedGoals.length === 0 ? (
          <p className="text-xs text-muted-foreground">Brak w tym tygodniu</p>
        ) : (
          <ul className="space-y-2">
            {achievedGoals.slice(0, 5).map((entry) => (
              <li key={entry.id} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                <span className="text-sm line-clamp-2">{entry.content}</span>
              </li>
            ))}
            {achievedGoals.length > 5 && (
              <li className="text-xs text-muted-foreground">
                +{achievedGoals.length - 5} więcej
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Do poprawy */}
      <div className="rounded-2xl border border-border/50 bg-card p-5 dark:glass-card glass-card-light">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Do poprawy</h3>
            {improvements.length > 0 && (
              <p className="text-xs text-muted-foreground">{improvements.length} w tym tygodniu</p>
            )}
          </div>
        </div>
        {improvements.length === 0 ? (
          <p className="text-xs text-muted-foreground">Brak w tym tygodniu</p>
        ) : (
          <ul className="space-y-1.5">
            {improvements.slice(0, 3).map((entry) => (
              <li key={entry.id} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="text-sm line-clamp-1">{entry.content}</span>
              </li>
            ))}
            {improvements.length > 3 && (
              <li className="text-xs text-muted-foreground">
                +{improvements.length - 3} więcej
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Streak / Notatki */}
      <div className="rounded-2xl border border-border/50 bg-card p-5 dark:glass-card glass-card-light">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
            <StickyNote className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Notatki</h3>
            {notes.length > 0 && (
              <p className="text-xs text-muted-foreground">{notes.length} w tym tygodniu</p>
            )}
          </div>
        </div>
        {notes.length === 0 ? (
          <p className="text-xs text-muted-foreground">Brak w tym tygodniu</p>
        ) : (
          <ul className="space-y-1.5">
            {notes.slice(0, 3).map((entry) => (
              <li key={entry.id} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                <span className="text-sm line-clamp-1">{entry.content}</span>
              </li>
            ))}
            {notes.length > 3 && (
              <li className="text-xs text-muted-foreground">
                +{notes.length - 3} więcej
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Weekly total — accent card */}
      <div className="sm:col-span-2 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-5 dark:from-primary/10 dark:to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Podsumowanie tygodnia</p>
              <p className="text-xs text-muted-foreground">
                {entries.length} {entries.length === 1 ? 'wpis' : entries.length < 5 ? 'wpisy' : 'wpisów'} w dzienniku
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-green-500">{achievedGoals.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cele</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-primary">{improvements.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Poprawy</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{notes.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Notatki</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
