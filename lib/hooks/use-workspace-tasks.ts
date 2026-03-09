'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getT } from '@/lib/i18n'
import type { Task, TaskStatus, TaskPriority } from '@/lib/types'

export interface WorkspaceTaskFormData {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  due_time?: string
}

export function useWorkspaceTasks(workspaceId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!workspaceId) {
      setTasks([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

      if (!cancelled) {
        if (error) toast.error(getT().errors.loadTasks)
        setTasks(data ?? [])
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [workspaceId, refreshKey])

  const createTask = useCallback(async (data: WorkspaceTaskFormData) => {
    if (!workspaceId) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: created, error } = await supabase
      .from('tasks')
      .insert({
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date || null,
        due_time: data.due_time || null,
        created_by: user.id,
        workspace_id: workspaceId,
        position: 0,
      })
      .select()
      .single()

    if (error) {
      toast.error(getT().errors.addTask)
      return
    }
    if (created) setTasks(prev => [created, ...prev])
  }, [workspaceId])

  const updateTask = useCallback(async (taskId: string, data: Partial<WorkspaceTaskFormData>) => {
    const snapshot = tasks
    setTasks(current =>
      current.map(t => t.id === taskId ? { ...t, ...data, updated_at: new Date().toISOString() } : t)
    )

    const supabase = createClient()
    const { error } = await supabase
      .from('tasks')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', taskId)

    if (error) {
      toast.error(getT().errors.updateTask)
      setTasks(snapshot)
    }
  }, [tasks])

  const deleteTask = useCallback(async (taskId: string) => {
    const snapshot = tasks
    setTasks(current => current.filter(t => t.id !== taskId))

    const supabase = createClient()
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)

    if (error) {
      toast.error(getT().errors.deleteTask)
      setTasks(snapshot)
    }
  }, [tasks])

  const changeStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    const snapshot = tasks
    setTasks(current =>
      current.map(t => t.id === taskId ? { ...t, status, updated_at: new Date().toISOString() } : t)
    )

    const supabase = createClient()
    const { error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId)

    if (error) {
      toast.error(getT().errors.changeStatus)
      setTasks(snapshot)
    }
  }, [tasks])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  return { tasks, loading, createTask, updateTask, deleteTask, changeStatus, refresh }
}
