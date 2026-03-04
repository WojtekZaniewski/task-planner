'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/dashboard/glass-card'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import type { TaskFormData } from '@/lib/hooks/use-tasks'

interface QuickAddTileProps {
  onAdd: (data: TaskFormData) => Promise<void>
}

export function QuickAddTile({ onAdd }: QuickAddTileProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || loading) return

    setLoading(true)
    try {
      await onAdd({
        title: title.trim(),
        description: description.trim() || undefined,
        status: 'todo',
        priority: 'medium',
      })
      setTitle('')
      setDescription('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="bento-tall flex flex-col">
      <h2 className="font-semibold text-foreground mb-4">Nowe Zadanie</h2>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
        <div className="flex-1 flex flex-col justify-center gap-4">
          <div>
            <label htmlFor="quick-add-title" className="text-xs text-muted-foreground mb-1.5 block">
              Co musisz zrobić?
            </label>
            <Input
              id="quick-add-title"
              placeholder="Np. Przygotować prezentację..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-button text-sm border-0 rounded-2xl px-4 py-3 h-auto focus-visible:ring-primary/30"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="quick-add-desc" className="text-xs text-muted-foreground mb-1.5 block">
              Po co?
            </label>
            <Input
              id="quick-add-desc"
              placeholder="Np. Aby zdać egzamin..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-button text-sm border-0 rounded-2xl px-4 py-3 h-auto focus-visible:ring-primary/30"
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="glass-button-primary w-full rounded-2xl px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          Dodaj zadanie
        </button>
      </form>
    </GlassCard>
  )
}
