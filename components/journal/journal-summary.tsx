'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, TrendingUp, StickyNote, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
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
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Brak wpisów w tym tygodniu — przejdź do Dziennika i zacznij zapisywać postępy!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Osiągnięte cele */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Trophy className="h-4 w-4 text-green-600" />
            Osiągnięte cele
            {achievedGoals.length > 0 && (
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {achievedGoals.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievedGoals.length === 0 ? (
            <p className="text-xs text-muted-foreground">Brak w tym tygodniu</p>
          ) : (
            <ul className="space-y-1.5">
              {achievedGoals.slice(0, 4).map((entry) => (
                <li key={entry.id} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  <span className="text-sm line-clamp-2">{entry.content}</span>
                </li>
              ))}
              {achievedGoals.length > 4 && (
                <li className="text-xs text-muted-foreground">
                  +{achievedGoals.length - 4} więcej
                </li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Do poprawy */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            Do poprawy
            {improvements.length > 0 && (
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {improvements.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {improvements.length === 0 ? (
            <p className="text-xs text-muted-foreground">Brak w tym tygodniu</p>
          ) : (
            <ul className="space-y-1.5">
              {improvements.slice(0, 4).map((entry) => (
                <li key={entry.id} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                  <span className="text-sm line-clamp-2">{entry.content}</span>
                </li>
              ))}
              {improvements.length > 4 && (
                <li className="text-xs text-muted-foreground">
                  +{improvements.length - 4} więcej
                </li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Ostatnie notatki */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <StickyNote className="h-4 w-4 text-gray-500" />
            Notatki
            {notes.length > 0 && (
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {notes.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="text-xs text-muted-foreground">Brak w tym tygodniu</p>
          ) : (
            <ul className="space-y-1.5">
              {notes.slice(0, 3).map((entry) => (
                <li key={entry.id} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                  <span className="text-sm line-clamp-2">{entry.content}</span>
                </li>
              ))}
              {notes.length > 3 && (
                <li className="text-xs text-muted-foreground">
                  +{notes.length - 3} więcej
                </li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
