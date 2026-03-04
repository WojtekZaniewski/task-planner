'use client'

import { useTasks } from '@/lib/hooks/use-tasks'
import { BentoGrid } from '@/components/dashboard/bento-grid'
import { HeroTile } from '@/components/dashboard/tiles/hero-tile'
import { TodaysTasksTile } from '@/components/dashboard/tiles/todays-tasks-tile'
import { QuickAddTile } from '@/components/dashboard/tiles/quick-add-tile'
import { StatsTile } from '@/components/dashboard/tiles/stats-tile'
import { UpcomingTile } from '@/components/dashboard/tiles/upcoming-tile'
import { CategoriesTile } from '@/components/dashboard/tiles/categories-tile'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { tasks, loading, createTask, changeStatus } = useTasks()

  if (loading) {
    return (
      <div className="bento-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className={`rounded-bento ${i === 0 ? 'bento-2x2' : i === 1 ? 'bento-1x2' : i === 4 ? 'bento-2x1' : 'bento-1x1'}`}
          />
        ))}
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const todaysTasks = tasks.filter(t => t.due_date === today && t.status !== 'done')
  const doneTodayCount = tasks.filter(t => t.due_date === today && t.status === 'done').length
  const todoCount = tasks.filter(t => t.status !== 'done').length
  const doneTasks = tasks.filter(t => t.status === 'done')
  const upcomingTasks = tasks
    .filter(t => t.status !== 'done' && t.due_date && t.due_date >= today)
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!))
    .slice(0, 5)

  return (
    <BentoGrid>
      <HeroTile todoCount={todoCount} doneToday={doneTodayCount} />
      <TodaysTasksTile tasks={todaysTasks} onStatusChange={changeStatus} />
      <QuickAddTile onAdd={createTask} />
      <StatsTile total={tasks.length} done={doneTasks.length} />
      <UpcomingTile tasks={upcomingTasks} />
      <CategoriesTile tasks={tasks} />
    </BentoGrid>
  )
}
