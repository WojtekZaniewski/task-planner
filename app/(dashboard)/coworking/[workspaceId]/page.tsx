'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Settings, CheckSquare, Lightbulb } from 'lucide-react'
import { useTasks } from '@/lib/hooks/use-tasks'
import { useAppStore } from '@/lib/store'
import { ViewSwitcher } from '@/components/tasks/view-switcher'
import { TaskForm, type TaskFormData } from '@/components/tasks/task-form'
import { TaskListView } from '@/components/tasks/task-list-view'
import { TaskKanbanView } from '@/components/tasks/task-kanban-view'
import { TaskCalendarDay } from '@/components/tasks/task-calendar-day'
import { TaskCalendarWeek } from '@/components/tasks/task-calendar-week'
import { TaskCalendarMonth } from '@/components/tasks/task-calendar-month'
import { ThoughtsSection } from '@/components/thoughts/thoughts-section'
import type { Task, Workspace, Profile } from '@/lib/types'
import Link from 'next/link'

export default function WorkspaceDashboard() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const { currentView, setCurrentView } = useAppStore()
  const { tasks, loading, createTask, updateTask, deleteTask, changeStatus } =
    useTasks({ workspaceId })

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [members, setMembers] = useState<Profile[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchWorkspace() {
      const { data } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single()
      setWorkspace(data)
    }

    async function fetchMembers() {
      const { data } = await supabase
        .from('workspace_members')
        .select('user_id, profiles(id, full_name, avatar_url)')
        .eq('workspace_id', workspaceId)

      const profiles = (data ?? [])
        .map((m: any) => m.profiles)
        .filter(Boolean)
      setMembers(profiles)
    }

    fetchWorkspace()
    fetchMembers()
  }, [workspaceId, supabase])

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

  if (loading || !workspace) {
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
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-sm text-muted-foreground">
              {workspace.description}
            </p>
          )}
        </div>
        <Link href={`/coworking/${workspaceId}/settings`}>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
            Ustawienia
          </Button>
        </Link>
      </div>

      {/* Tabs: Tasks and Thoughts */}
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-1.5">
            <CheckSquare className="h-4 w-4" />
            Zadania
          </TabsTrigger>
          <TabsTrigger value="thoughts" className="gap-1.5">
            <Lightbulb className="h-4 w-4" />
            Przemyślenia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4 space-y-4">
          {/* Task controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ViewSwitcher
              currentView={currentView}
              onViewChange={setCurrentView}
            />
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nowe zadanie</span>
            </Button>
          </div>

          {/* Views */}
          {currentView === 'list' && (
            <TaskListView
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={deleteTask}
              onStatusChange={changeStatus}
              showAssignee
            />
          )}

          {currentView === 'kanban' && (
            <TaskKanbanView
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={deleteTask}
              onStatusChange={changeStatus}
              showAssignee
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
              showAssignee
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
              showAssignee
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
        </TabsContent>

        <TabsContent value="thoughts" className="mt-4">
          <ThoughtsSection workspaceId={workspaceId} />
        </TabsContent>
      </Tabs>

      {/* Task form dialog */}
      <TaskForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleSubmit}
        initialData={editingTask}
        members={members}
        showAssignee
      />
    </div>
  )
}
