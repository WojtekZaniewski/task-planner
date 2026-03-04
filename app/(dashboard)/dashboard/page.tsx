'use client'

import { useTasks } from '@/lib/hooks/use-tasks'
import { BentoGrid } from '@/components/dashboard/bento-grid'
import { HeroTile } from '@/components/dashboard/tiles/hero-tile'
import { QuickAddTile } from '@/components/dashboard/tiles/quick-add-tile'
import { FeaturedTile } from '@/components/dashboard/tiles/featured-tile'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { tasks, loading, createTask, changeStatus } = useTasks()

  if (loading) {
    return (
      <div className="bento-grid">
        <Skeleton className="rounded-bento bento-hero" />
        <Skeleton className="rounded-bento bento-tall" />
        <Skeleton className="rounded-bento bento-1x1" />
      </div>
    )
  }

  const activeTasks = tasks.filter(t => t.status !== 'done')
  const doneTasks = tasks.filter(t => t.status === 'done')
  const nextTask = activeTasks
    .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''))
    [0] || null

  return (
    <BentoGrid>
      <HeroTile total={tasks.length} done={doneTasks.length} />
      <QuickAddTile onAdd={createTask} />
      <FeaturedTile task={nextTask} />
    </BentoGrid>
  )
}
