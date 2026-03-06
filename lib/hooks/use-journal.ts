'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CompletedMission, Thought } from '@/lib/types'
import { MISSION_STORAGE_KEY } from '@/components/dashboard/tiles/hero-tile'

const JOURNAL_KEY = 'task-planner-journal'
const THOUGHTS_KEY = 'task-planner-thoughts'

function loadJournal(): CompletedMission[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(JOURNAL_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveJournal(missions: CompletedMission[]) {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(missions))
}

function loadThoughts(): Thought[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(THOUGHTS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveThoughts(thoughts: Thought[]) {
  localStorage.setItem(THOUGHTS_KEY, JSON.stringify(thoughts))
}

export function useJournal() {
  const [completedMissions, setCompletedMissions] = useState<CompletedMission[]>([])
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setCompletedMissions(loadJournal())
    setThoughts(loadThoughts())
    setLoading(false)
  }, [])

  const archiveMission = useCallback(
    (name: string, target: number, tasksCompleted: number, startedAt: string, deadline?: string, moneyGoal?: number) => {
      const missionId = crypto.randomUUID()
      const now = new Date().toISOString()

      // Collect thoughts for the active mission
      const currentThoughts = loadThoughts()
      const missionThoughts = currentThoughts.filter(t => t.missionId === 'active')
      const updatedMissionThoughts = missionThoughts.map(t => ({ ...t, missionId: missionId }))
      const remainingThoughts = currentThoughts.filter(t => t.missionId !== 'active')

      const mission: CompletedMission = {
        id: missionId,
        name,
        target,
        tasksCompleted,
        startedAt,
        completedAt: now,
        deadline,
        moneyGoal,
        thoughts: updatedMissionThoughts,
      }

      setCompletedMissions(prev => {
        const updated = [mission, ...prev]
        saveJournal(updated)
        return updated
      })

      // Update thoughts — reassign active → missionId, keep rest
      setThoughts(remainingThoughts.concat(updatedMissionThoughts))
      saveThoughts(remainingThoughts.concat(updatedMissionThoughts))
    },
    []
  )

  const addThought = useCallback(
    (text: string) => {
      const thought: Thought = {
        id: crypto.randomUUID(),
        text,
        createdAt: new Date().toISOString(),
        missionId: 'active',
      }

      setThoughts(prev => {
        const updated = [thought, ...prev]
        saveThoughts(updated)
        return updated
      })
    },
    []
  )

  const getThoughtsForMission = useCallback(
    (missionId: string): Thought[] => {
      // First check embedded thoughts in completed missions
      const mission = completedMissions.find(m => m.id === missionId)
      if (mission?.thoughts.length) return mission.thoughts
      // Fallback to global thoughts list
      return thoughts.filter(t => t.missionId === missionId)
    },
    [completedMissions, thoughts]
  )

  const getWeeklySummary = useCallback(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoISO = weekAgo.toISOString()

    const recentMissions = completedMissions.filter(m => m.completedAt >= weekAgoISO)
    const totalTasks = recentMissions.reduce((sum, m) => sum + m.tasksCompleted, 0)

    return {
      missions: recentMissions,
      missionsCount: recentMissions.length,
      totalTasks,
    }
  }, [completedMissions])

  const activeThoughts = thoughts.filter(t => t.missionId === 'active')

  return {
    completedMissions,
    thoughts,
    activeThoughts,
    loading,
    archiveMission,
    addThought,
    getThoughtsForMission,
    getWeeklySummary,
  }
}
