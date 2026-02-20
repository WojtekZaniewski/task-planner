'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, StickyNote, Trophy, TrendingUp, Trash2, Loader2, BookOpen } from 'lucide-react'
import { useJournal } from '@/lib/hooks/use-journal'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { JournalEntryType } from '@/lib/types'

const typeConfig: Record<
  JournalEntryType,
  { label: string; icon: React.ElementType; color: string }
> = {
  note: { label: 'Notatka', icon: StickyNote, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  achieved_goal: { label: 'Osiągnięty cel', icon: Trophy, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  improvement: { label: 'Do poprawy', icon: TrendingUp, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
}

interface JournalSectionProps {
  workspaceId?: string
  isPrivate?: boolean
}

export function JournalSection({ workspaceId, isPrivate }: JournalSectionProps) {
  const { entries, loading, createEntry, deleteEntry } = useJournal({
    workspaceId,
    isPrivate,
  })

  const [content, setContent] = useState('')
  const [type, setType] = useState<JournalEntryType>('note')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    try {
      await createEntry(content.trim(), type)
      setContent('')
      setShowForm(false)
    } catch {
      // error handled in hook
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Nowy wpis
        </Button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border bg-card p-4 space-y-3"
        >
          <div className="flex gap-3">
            <Select value={type} onValueChange={(v) => setType(v as JournalEntryType)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">
                  <span className="flex items-center gap-2">
                    <StickyNote className="h-3.5 w-3.5" /> Notatka
                  </span>
                </SelectItem>
                <SelectItem value="achieved_goal">
                  <span className="flex items-center gap-2">
                    <Trophy className="h-3.5 w-3.5" /> Osiągnięty cel
                  </span>
                </SelectItem>
                <SelectItem value="improvement">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5" /> Do poprawy
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === 'note'
                ? 'Zapisz swoje przemyślenia...'
                : type === 'achieved_goal'
                  ? 'Jaki cel udało Ci się osiągnąć?'
                  : 'Co chcesz poprawić?'
            }
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(false)
                setContent('')
              }}
            >
              Anuluj
            </Button>
            <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Dodaj
            </Button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">Brak wpisów w dzienniku</p>
          <p className="text-sm text-muted-foreground">
            Zapisuj notatki, osiągnięte cele i rzeczy do poprawy
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const config = typeConfig[entry.type]
            const Icon = config.icon

            return (
              <div
                key={entry.id}
                className="group rounded-lg border bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={cn('text-xs', config.color)}
                        >
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(entry.created_at), 'd MMM yyyy, HH:mm', {
                            locale: pl,
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => deleteEntry(entry.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
