'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useTasks } from '@/lib/hooks/use-tasks'
import { useAppStore } from '@/lib/store'
import { TaskForm, type TaskFormData } from '@/components/tasks/task-form'
import { TaskListView } from '@/components/tasks/task-list-view'
import { TaskStatsBento } from '@/components/dashboard/task-stats-bento'
import type { Task } from '@/lib/types'

export default function TasksPage() {
  const { setUserName, setAvatarUrl, setWorkspaceCount } = useAppStore()
  const { tasks, loading, createTask, updateTask, deleteTask, changeStatus } =
    useTasks({ isPrivate: true })

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    const container = document.querySelector('[data-user-name]')
    if (container) {
      const name = container.getAttribute('data-user-name') || ''
      const avatar = container.getAttribute('data-avatar-url') || null
      if (name) setUserName(name)
      if (avatar) setAvatarUrl(avatar)
      const wsCount = parseInt(container.getAttribute('data-workspace-count') || '0', 10)
      setWorkspaceCount(wsCount)
    }
  }, [])

  const todoCount = tasks.filter(t => t.status === 'todo').length
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length
  const doneCount = tasks.filter(t => t.status === 'done').length
  const totalCount = tasks.length

  function handleEdit(task: Task) {
    setEditingTask(task)
    setFormOpen(true)
  }

  async function handleSubmit(data: TaskFormData) {
    if (editingTask) {
      await updateTask(editingTask.id, data)
    } else {
      await createTask(data)
    }
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) setEditingTask(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <TaskStatsBento
        todo={todoCount}
        inProgress={inProgressCount}
        done={doneCount}
        total={totalCount}
      />

      <div className="flex items-center justify-end">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          nowe zadanie
        </Button>
      </div>

      <TaskListView
        tasks={tasks}
        onEdit={handleEdit}
        onDelete={deleteTask}
        onStatusChange={changeStatus}
      />

      <TaskForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        initialData={editingTask}
      />
    </div>
  )
}
