'use client'

import { useState, useCallback } from 'react'
import { useTasks } from '@/lib/hooks/use-tasks'
import { BentoGrid } from '@/components/dashboard/bento-grid'
import { HeroTile } from '@/components/dashboard/tiles/hero-tile'
import { QuickAddTile } from '@/components/dashboard/tiles/quick-add-tile'
import { TaskTile } from '@/components/dashboard/tiles/task-tile'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { tasks, loading, createTask, changeStatus, deleteTask } = useTasks()
  const [missionActive, setMissionActive] = useState(false)

  const handleMissionChange = useCallback((active: boolean) => {
    setMissionActive(active)
  }, [])

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
    <BentoGrid>
      <HeroTile total={tasks.length} done={doneTasks.length} onMissionChange={handleMissionChange} />
      <QuickAddTile onAdd={createTask} missionActive={missionActive} />
      {tasks.map(task => (
        <TaskTile
          key={task.id}
          task={task}
          onStatusChange={changeStatus}
          onDelete={deleteTask}
        />
      ))}
    </BentoGrid>
  )
}
