'use client'

import { useState } from 'react'
import { TaskCard } from '@/components/tasks/task-card'
import { TaskForm } from '@/components/tasks/task-form'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import type { Task, TaskStatus } from '@/lib/types'
import type { TaskFormData } from '@/lib/hooks/use-tasks'
import { GlassCard } from '@/components/dashboard/glass-card'

interface TaskListViewProps {
  tasks: Task[]
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onCreateTask: (data: TaskFormData) => Promise<void>
  onUpdateTask: (taskId: string, data: Partial<TaskFormData>) => Promise<void>
  onDeleteTask: (taskId: string) => Promise<void>
}

export function TaskListView({
  tasks,
  onStatusChange,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}: TaskListViewProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  const filtered = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
    return true
  })

  const grouped = {
    todo: filtered.filter(t => t.status === 'todo'),
    in_progress: filtered.filter(t => t.status === 'in_progress'),
    done: filtered.filter(t => t.status === 'done'),
  }

  function handleEdit(task: Task) {
    setEditTask(task)
    setFormOpen(true)
  }

  async function handleFormSubmit(data: TaskFormData) {
    if (editTask) {
      await onUpdateTask(editTask.id, data)
    } else {
      await onCreateTask(data)
    }
    setEditTask(null)
  }

  const labels: Record<string, string> = {
    todo: 'Do zrobienia',
    in_progress: 'W trakcie',
    done: 'Zrobione',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-white/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="todo">Do zrobienia</SelectItem>
              <SelectItem value="in_progress">W trakcie</SelectItem>
              <SelectItem value="done">Zrobione</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32 bg-white/50">
              <SelectValue placeholder="Priorytet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="urgent">Pilne</SelectItem>
              <SelectItem value="high">Wysokie</SelectItem>
              <SelectItem value="medium">Średnie</SelectItem>
              <SelectItem value="low">Niskie</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditTask(null); setFormOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Nowe zadanie
        </Button>
      </div>

      {Object.entries(grouped).map(([status, statusTasks]) => {
        if (statusTasks.length === 0) return null
        return (
          <div key={status}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {labels[status]} ({statusTasks.length})
            </h3>
            <div className="space-y-2">
              {statusTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={onStatusChange}
                  onEdit={handleEdit}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <GlassCard className="py-12 text-center" hover={false}>
          <p className="text-muted-foreground">Brak zadań</p>
          <Button variant="link" className="mt-2 text-primary" onClick={() => { setEditTask(null); setFormOpen(true) }}>
            Utwórz pierwsze zadanie
          </Button>
        </GlassCard>
      )}

      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        editTask={editTask}
      />
    </div>
  )
}
