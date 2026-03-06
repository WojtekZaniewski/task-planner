'use client'

import { useState, useCallback } from 'react'
import { Send } from 'lucide-react'
import { useTasks } from '@/lib/hooks/use-tasks'
import { useJournal } from '@/lib/hooks/use-journal'
import { BentoGrid } from '@/components/dashboard/bento-grid'
import { HeroTile } from '@/components/dashboard/tiles/hero-tile'
import { QuickAddTile } from '@/components/dashboard/tiles/quick-add-tile'
import { JournalTile } from '@/components/dashboard/tiles/journal-tile'
import { TaskTile } from '@/components/dashboard/tiles/task-tile'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { tasks, loading, createTask, changeStatus, deleteTask } = useTasks()
  const { addThought, archiveMission } = useJournal()
  const [missionActive, setMissionActive] = useState(false)
  const [thoughtText, setThoughtText] = useState('')

  const handleMissionChange = useCallback((active: boolean) => {
    setMissionActive(active)
  }, [])

  function handleThoughtSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!thoughtText.trim()) return
    addThought(thoughtText.trim())
    setThoughtText('')
  }

  if (loading) {
    return (
      <div className="bento-grid">
        <Skeleton className="rounded-bento bento-1x1" />
        <Skeleton className="rounded-bento bento-1x1" />
        <Skeleton className="rounded-bento bento-1x1" />
      </div>
    )
  }

  const doneTasks = tasks.filter(t => t.status === 'done')

  return (
    <div className="space-y-4">
      <BentoGrid>
        <HeroTile
          total={tasks.length}
          done={doneTasks.length}
          onMissionChange={handleMissionChange}
          onMissionComplete={archiveMission}
        />
        <QuickAddTile onAdd={createTask} missionActive={missionActive} />
        <JournalTile />
        {tasks.map(task => (
          <TaskTile
            key={task.id}
            task={task}
            onStatusChange={changeStatus}
            onDelete={deleteTask}
          />
        ))}
      </BentoGrid>

      <form
        onSubmit={handleThoughtSubmit}
        className="glass rounded-bento px-5 py-3 flex items-center gap-3"
      >
        <input
          type="text"
          placeholder="Twoje przemyślenia dzisiaj..."
          value={thoughtText}
          onChange={(e) => setThoughtText(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button
          type="submit"
          aria-label="Dodaj przemyślenie"
          disabled={!thoughtText.trim()}
          className="text-primary disabled:opacity-30 transition-opacity"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
