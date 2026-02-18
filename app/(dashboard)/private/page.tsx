'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useTasks } from '@/lib/hooks/use-tasks'
import { useAppStore } from '@/lib/store'
import { ViewSwitcher } from '@/components/tasks/view-switcher'
import { TaskForm, type TaskFormData } from '@/components/tasks/task-form'
import { TaskListView } from '@/components/tasks/task-list-view'
import { TaskKanbanView } from '@/components/tasks/task-kanban-view'
import { TaskCalendarDay } from '@/components/tasks/task-calendar-day'
import { TaskCalendarWeek } from '@/components/tasks/task-calendar-week'
import { TaskCalendarMonth } from '@/components/tasks/task-calendar-month'
import type { Task, CalendarView } from '@/lib/types'

export default function PrivatePage() {
  const { currentView, setCurrentView } = useAppStore()
  const { tasks, loading, createTask, updateTask, deleteTask, changeStatus } =
    useTasks({ isPrivate: true })

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())

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

  function handleDayClick(date: Date) {
    setSelectedDate(date)
    setCurrentView('day')
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prywatne zadania</h1>
          <p className="text-sm text-muted-foreground">
            Twoje osobiste zadania i plany
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewSwitcher
            currentView={currentView}
            onViewChange={setCurrentView}
          />
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nowe zadanie</span>
          </Button>
        </div>
      </div>

      {/* Views */}
      {currentView === 'list' && (
        <TaskListView
          tasks={tasks}
          onEdit={handleEdit}
          onDelete={deleteTask}
          onStatusChange={changeStatus}
        />
      )}

      {currentView === 'kanban' && (
        <TaskKanbanView
          tasks={tasks}
          onEdit={handleEdit}
          onDelete={deleteTask}
          onStatusChange={changeStatus}
        />
      )}

      {currentView === 'day' && (
        <TaskCalendarDay
          tasks={tasks}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onEdit={handleEdit}
          onDelete={deleteTask}
          onStatusChange={changeStatus}
        />
      )}

      {currentView === 'week' && (
        <TaskCalendarWeek
          tasks={tasks}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onEdit={handleEdit}
          onDelete={deleteTask}
          onStatusChange={changeStatus}
        />
      )}

      {currentView === 'month' && (
        <TaskCalendarMonth
          tasks={tasks}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onDayClick={handleDayClick}
        />
      )}

      {/* Task form dialog */}
      <TaskForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        initialData={editingTask}
      />
    </div>
  )
}
