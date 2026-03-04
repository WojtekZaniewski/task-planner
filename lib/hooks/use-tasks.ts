'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Task, TaskStatus, TaskPriority } from '@/lib/types'

export interface TaskFormData {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  due_time?: string
}

const STORAGE_KEY = 'task-planner-tasks'

function loadTasks(): Task[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTasks(loadTasks())
    setLoading(false)
  }, [])

  const createTask = useCallback(
    async (data: TaskFormData) => {
      const now = new Date().toISOString()
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        due_date: data.due_date || null,
        due_time: data.due_time || null,
        created_by: 'local',
        position: 0,
        created_at: now,
        updated_at: now,
      }

      setTasks(prev => {
        const updated = [newTask, ...prev]
        saveTasks(updated)
        return updated
      })
    },
    []
  )

  const updateTask = useCallback(
    async (taskId: string, data: Partial<TaskFormData>) => {
      setTasks(prev => {
        const updated = prev.map(t => {
          if (t.id !== taskId) return t
          return {
            ...t,
            ...data,
            updated_at: new Date().toISOString(),
          }
        })
        saveTasks(updated)
        return updated
      })
    },
    []
  )

  const deleteTask = useCallback(
    async (taskId: string) => {
      setTasks(prev => {
        const updated = prev.filter(t => t.id !== taskId)
        saveTasks(updated)
        return updated
      })
    },
    []
  )

  const changeStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      setTasks(prev => {
        const updated = prev.map(t =>
          t.id === taskId ? { ...t, status, updated_at: new Date().toISOString() } : t
        )
        saveTasks(updated)
        return updated
      })
    },
    []
  )

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    changeStatus,
    refresh: () => setTasks(loadTasks()),
  }
}
