'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task } from '@/lib/types'
import { toast } from 'sonner'
import type { TaskFormData } from '@/components/tasks/task-form'

interface UseTasksOptions {
  workspaceId?: string | null
  isPrivate?: boolean
}

export function useTasks({ workspaceId, isPrivate }: UseTasksOptions) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    let query = supabase
      .from('tasks')
      .select('*, assigned_profile:profiles!tasks_assigned_to_fkey(id, full_name, avatar_url), creator_profile:profiles!tasks_created_by_fkey(id, full_name, avatar_url)')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })

    if (isPrivate) {
      query = query.is('workspace_id', null)
    } else if (workspaceId) {
      query = query.eq('workspace_id', workspaceId)
    }

    const { data, error } = await query

    if (error) {
      toast.error('Nie udało się pobrać zadań')
      console.error(error)
    } else {
      setTasks(data ?? [])
    }
    setLoading(false)
  }, [workspaceId, isPrivate, supabase])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Subscribe to real-time changes for workspace tasks
  useEffect(() => {
    if (!workspaceId) return

    const channel = supabase
      .channel(`tasks:${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [workspaceId, supabase, fetchTasks])

  const createTask = useCallback(
    async (data: TaskFormData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from('tasks').insert({
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date || null,
        due_time: data.due_time || null,
        workspace_id: isPrivate ? null : workspaceId,
        created_by: user.id,
        assigned_to: data.assigned_to,
      })

      if (error) {
        toast.error('Nie udało się utworzyć zadania')
        console.error(error)
        throw error
      }

      toast.success('Zadanie utworzone')
      fetchTasks()
    },
    [supabase, workspaceId, isPrivate, fetchTasks]
  )

  const updateTask = useCallback(
    async (taskId: string, data: Partial<TaskFormData>) => {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

      if (data.title !== undefined) updates.title = data.title
      if (data.description !== undefined) updates.description = data.description || null
      if (data.status !== undefined) updates.status = data.status
      if (data.priority !== undefined) updates.priority = data.priority
      if (data.due_date !== undefined) updates.due_date = data.due_date || null
      if (data.due_time !== undefined) updates.due_time = data.due_time || null
      if (data.assigned_to !== undefined) updates.assigned_to = data.assigned_to

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)

      if (error) {
        toast.error('Nie udało się zaktualizować zadania')
        console.error(error)
        throw error
      }

      fetchTasks()
    },
    [supabase, fetchTasks]
  )

  const deleteTask = useCallback(
    async (taskId: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)

      if (error) {
        toast.error('Nie udało się usunąć zadania')
        console.error(error)
        throw error
      }

      toast.success('Zadanie usunięte')
      fetchTasks()
    },
    [supabase, fetchTasks]
  )

  const changeStatus = useCallback(
    async (taskId: string, status: string) => {
      await updateTask(taskId, { status: status as any })
    },
    [updateTask]
  )

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    changeStatus,
    refresh: fetchTasks,
  }
}
