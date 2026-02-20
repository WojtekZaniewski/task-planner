'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Plus, CheckSquare, BookOpen } from 'lucide-react'
import { useTasks } from '@/lib/hooks/use-tasks'
import { useAppStore } from '@/lib/store'
import { ViewSwitcher } from '@/components/tasks/view-switcher'
import { TaskForm, type TaskFormData } from '@/components/tasks/task-form'
import { TaskListView } from '@/components/tasks/task-list-view'
import { TaskKanbanView } from '@/components/tasks/task-kanban-view'
import { TaskCalendarDay } from '@/components/tasks/task-calendar-day'
import { TaskCalendarWeek } from '@/components/tasks/task-calendar-week'
import { TaskCalendarMonth } from '@/components/tasks/task-calendar-month'
import { JournalSection } from '@/components/journal/journal-section'
import { JournalSummary } from '@/components/journal/journal-summary'
import { TaskStatsBento } from '@/components/dashboard/task-stats-bento'
import type { Task, AppMode } from '@/lib/types'

export default function PrivatePage() {
  const {
    currentView, setCurrentView,
    appMode, setAppMode,
    userName, setUserName,
    avatarUrl, setAvatarUrl,
  } = useAppStore()
  const { tasks, loading, createTask, updateTask, deleteTask, changeStatus } =
    useTasks({ isPrivate: true })

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Read data attributes from DOM set by server layout
  useEffect(() => {
    const container = document.querySelector('[data-app-mode]')
    if (container) {
      const mode = container.getAttribute('data-app-mode') as AppMode
      const name = container.getAttribute('data-user-name') || ''
      const avatar = container.getAttribute('data-avatar-url') || null
      if (mode) {
        setAppMode(mode)
        if (mode === 'tasks' && !['day', 'week'].includes(currentView)) {
          setCurrentView('day')
        }
      }
      if (name) setUserName(name)
      if (avatar) setAvatarUrl(avatar)
    }
  }, [])

  // Task stats
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

  function handleDayClick(date: Date) {
    setSelectedDate(date)
    setCurrentView('day')
  }

  const firstName = userName.split(' ')[0] || 'Użytkownik'
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Greeting Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Cześć, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {todoCount === 0
              ? 'Wszystkie zadania zrobione!'
              : `Masz ${todoCount} ${todoCount === 1 ? 'zadanie' : todoCount < 5 ? 'zadania' : 'zadań'} do zrobienia`}
          </p>
        </div>
      </div>

      {/* Task Stats Bento */}
      <TaskStatsBento
        todo={todoCount}
        inProgress={inProgressCount}
        done={doneCount}
        total={totalCount}
      />

      {/* Weekly journal summary */}
      <JournalSummary />

      {/* Tabs: Tasks and Journal */}
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-1.5">
            <CheckSquare className="h-4 w-4" />
            Zadania
          </TabsTrigger>
          <TabsTrigger value="journal" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            Dziennik
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4 space-y-4">
          {/* Task controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ViewSwitcher
              currentView={currentView}
              onViewChange={setCurrentView}
              appMode={appMode}
            />
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nowe zadanie</span>
            </Button>
          </div>

          {/* Views */}
          {currentView === 'list' && appMode === 'calendar' && (
            <TaskListView
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={deleteTask}
              onStatusChange={changeStatus}
            />
          )}

          {currentView === 'kanban' && appMode === 'calendar' && (
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

          {currentView === 'month' && appMode === 'calendar' && (
            <TaskCalendarMonth
              tasks={tasks}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onDayClick={handleDayClick}
            />
          )}
        </TabsContent>

        <TabsContent value="journal" className="mt-4">
          <JournalSection isPrivate />
        </TabsContent>
      </Tabs>

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
