'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskStatus, TaskPriority } from '@/lib/types'
import { toast } from 'sonner'

export interface TaskFormData {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  due_time?: string
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .is('workspace_id', null)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Nie udało się pobrać zadań')
      console.error(error)
    } else {
      setTasks(data ?? [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = useCallback(
    async (data: TaskFormData) => {
      // Try to get user, but don't require it
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase.from('tasks').insert({
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date || null,
        due_time: data.due_time || null,
        workspace_id: null,
        created_by: user?.id ?? '00000000-0000-0000-0000-000000000000',
      })

      if (error) {
        toast.error('Nie udało się utworzyć zadania')
        console.error(error)
        throw error
      }

      toast.success('Zadanie utworzone')
      fetchTasks()
    },
    [supabase, fetchTasks]
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
    async (taskId: string, status: TaskStatus) => {
      await updateTask(taskId, { status })
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
