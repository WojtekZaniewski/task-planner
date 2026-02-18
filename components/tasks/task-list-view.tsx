'use client'

import type { Task } from '@/lib/types'
import { TaskCard } from './task-card'

interface TaskListViewProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: string) => void
  showAssignee?: boolean
}

export function TaskListView({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  showAssignee = false,
}: TaskListViewProps) {
  const todoTasks = tasks.filter((t) => t.status === 'todo')
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress')
  const doneTasks = tasks.filter((t) => t.status === 'done')

  return (
    <div className="space-y-6">
      {todoTasks.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Do zrobienia ({todoTasks.length})
          </h3>
          <div className="space-y-2">
            {todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                showAssignee={showAssignee}
              />
            ))}
          </div>
        </section>
      )}

      {inProgressTasks.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            W trakcie ({inProgressTasks.length})
          </h3>
          <div className="space-y-2">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                showAssignee={showAssignee}
              />
            ))}
          </div>
        </section>
      )}

      {doneTasks.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Zrobione ({doneTasks.length})
          </h3>
          <div className="space-y-2">
            {doneTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                showAssignee={showAssignee}
              />
            ))}
          </div>
        </section>
      )}

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Brak zadań</p>
          <p className="text-sm text-muted-foreground">
            Kliknij &quot;Nowe zadanie&quot; aby dodać pierwsze zadanie
          </p>
        </div>
      )}
    </div>
  )
}
