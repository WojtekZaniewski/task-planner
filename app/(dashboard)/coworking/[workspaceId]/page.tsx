'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Settings, CheckSquare, Lightbulb, BookOpen } from 'lucide-react'
import { useTasks } from '@/lib/hooks/use-tasks'
import { TaskForm, type TaskFormData } from '@/components/tasks/task-form'
import { TaskListView } from '@/components/tasks/task-list-view'
import { ThoughtsSection } from '@/components/thoughts/thoughts-section'
import { JournalSection } from '@/components/journal/journal-section'
import type { Task, Workspace, Profile } from '@/lib/types'
import Link from 'next/link'

export default function WorkspaceDashboard() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const { tasks, loading, createTask, updateTask, deleteTask, changeStatus } =
    useTasks({ workspaceId })

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
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
          <h1 className="text-2xl font-display font-bold">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-sm text-muted-foreground">
              {workspace.description}
            </p>
          )}
        </div>
        <Link href={`/coworking/${workspaceId}/settings`}>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
            ustawienia
          </Button>
        </Link>
      </div>

      {/* Tabs: Tasks and Thoughts */}
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-1.5">
            <CheckSquare className="h-4 w-4" />
            zadania
          </TabsTrigger>
          <TabsTrigger value="thoughts" className="gap-1.5">
            <Lightbulb className="h-4 w-4" />
            przemyslenia
          </TabsTrigger>
          <TabsTrigger value="journal" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            dziennik
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4 space-y-4">
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
            showAssignee
          />
        </TabsContent>

        <TabsContent value="thoughts" className="mt-4">
          <ThoughtsSection workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="journal" className="mt-4">
          <JournalSection workspaceId={workspaceId} />
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
