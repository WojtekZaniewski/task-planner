'use client'

import { useTasks } from '@/lib/hooks/use-tasks'
import { TaskListView } from '@/components/tasks/task-list-view'
import { Skeleton } from '@/components/ui/skeleton'

export default function TasksPage() {
  const { tasks, loading, createTask, updateTask, deleteTask, changeStatus } = useTasks()

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <TaskListView
        tasks={tasks}
        onStatusChange={changeStatus}
        onCreateTask={createTask}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
      />
    </div>
  )
}
