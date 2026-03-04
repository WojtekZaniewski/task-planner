'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/dashboard/glass-card'
import { Input } from '@/components/ui/input'
import { Plus, Send } from 'lucide-react'
import type { TaskFormData } from '@/lib/hooks/use-tasks'

interface QuickAddTileProps {
  onAdd: (data: TaskFormData) => Promise<void>
}

export function QuickAddTile({ onAdd }: QuickAddTileProps) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || loading) return

    setLoading(true)
    try {
      await onAdd({
        title: title.trim(),
        status: 'todo',
        priority: 'medium',
      })
      setTitle('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="bento-tall flex flex-col">
      <h2 className="font-semibold text-foreground mb-4">Nowe Zadanie</h2>

      <div className="flex-1 flex flex-col items-center justify-center gap-5">
        <button
          type="button"
          aria-label="Dodaj nowe zadanie"
          onClick={() => {
            const input = document.getElementById('quick-add-input')
            input?.focus()
          }}
          className="glass-button flex h-16 w-16 items-center justify-center rounded-full"
        >
          <Plus className="h-7 w-7 text-primary" />
        </button>

        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <Input
            id="quick-add-input"
            placeholder="Wpisz zadanie..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="glass-button text-sm border-0 rounded-2xl px-4 py-3 h-auto focus-visible:ring-primary/30"
            disabled={loading}
          />
          {title.trim() && (
            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary w-full rounded-2xl px-4 py-3 text-sm font-medium flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Dodaj zadanie
            </button>
          )}
        </form>

        <p className="text-[10px] text-muted-foreground">Enter, aby dodać</p>
      </div>
    </GlassCard>
  )
}
