'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
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
import { Separator } from '@/components/ui/separator'
import { Plus, Lightbulb, Target, Trophy, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import type { Thought, ThoughtType } from '@/lib/types'

const typeConfig: Record<
  ThoughtType,
  { label: string; icon: React.ElementType; color: string }
> = {
  thought: { label: 'Przemyślenie', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-700' },
  goal: { label: 'Cel', icon: Target, color: 'bg-blue-100 text-blue-700' },
  achievement: { label: 'Osiągnięcie', icon: Trophy, color: 'bg-green-100 text-green-700' },
}

interface ThoughtsSectionProps {
  workspaceId: string
}

export function ThoughtsSection({ workspaceId }: ThoughtsSectionProps) {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [type, setType] = useState<ThoughtType>('thought')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  const fetchThoughts = useCallback(async () => {
    const { data, error } = await supabase
      .from('thoughts')
      .select('*, creator_profile:profiles!thoughts_created_by_fkey(id, full_name, avatar_url)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setThoughts(data ?? [])
    }
    setLoading(false)
  }, [workspaceId, supabase])

  useEffect(() => {
    fetchThoughts()
  }, [fetchThoughts])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`thoughts:${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'thoughts',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          fetchThoughts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [workspaceId, supabase, fetchThoughts])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from('thoughts').insert({
      content: content.trim(),
      type,
      workspace_id: workspaceId,
      created_by: user.id,
    })

    if (error) {
      toast.error('Nie udało się dodać')
      console.error(error)
    } else {
      toast.success('Dodano!')
      setContent('')
      setShowForm(false)
      fetchThoughts()
    }
    setSubmitting(false)
  }

  async function handleDelete(thoughtId: string) {
    const { error } = await supabase
      .from('thoughts')
      .delete()
      .eq('id', thoughtId)

    if (error) {
      toast.error('Nie udało się usunąć')
    } else {
      toast.success('Usunięto')
      fetchThoughts()
    }
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
          Dodaj przemyślenie
        </Button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border bg-card p-4 space-y-3"
        >
          <div className="flex gap-3">
            <Select value={type} onValueChange={(v) => setType(v as ThoughtType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thought">Przemyślenie</SelectItem>
                <SelectItem value="goal">Cel</SelectItem>
                <SelectItem value="achievement">Osiągnięcie</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Podziel się przemyśleniem, celem lub osiągnięciem..."
            rows={3}
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
              {submitting && <Loader2 className="animate-spin" />}
              Dodaj
            </Button>
          </div>
        </form>
      )}

      {thoughts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Lightbulb className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">Brak przemyśleń</p>
          <p className="text-sm text-muted-foreground">
            Podziel się przemyśleniami, celami i osiągnięciami z zespołem
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {thoughts.map((thought) => {
            const config = typeConfig[thought.type]
            const Icon = config.icon

            return (
              <div
                key={thought.id}
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
                          className={`text-xs ${config.color}`}
                        >
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {(thought as any).creator_profile?.full_name || 'Nieznany'} &middot;{' '}
                          {format(new Date(thought.created_at), 'd MMM, HH:mm', {
                            locale: pl,
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{thought.content}</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(thought.id)}
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
