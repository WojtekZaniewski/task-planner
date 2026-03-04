'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/dashboard/glass-card'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
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
    <GlassCard className="bento-1x1 flex flex-col items-center justify-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Plus className="h-6 w-6 text-primary" />
      </div>
      <form onSubmit={handleSubmit} className="w-full">
        <Input
          placeholder="Nowe zadanie..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-center text-sm bg-white/50 border-white/30 focus:border-primary/30"
          disabled={loading}
        />
      </form>
      <p className="text-[10px] text-muted-foreground">Enter, aby dodać</p>
    </GlassCard>
  )
}
