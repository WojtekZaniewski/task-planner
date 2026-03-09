'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getT } from '@/lib/i18n'
import type { WorkspaceCompletedMission, WorkspaceMissionThoughtRow, Thought } from '@/lib/types'

function rowToThought(row: WorkspaceMissionThoughtRow): Thought {
  return { id: row.id, text: row.text, createdAt: row.created_at, missionId: row.workspace_mission_id }
}

export function useWorkspaceJournal(workspaceId: string | null, activeMissionId: string | null) {
  const [completedMissions, setCompletedMissions] = useState<WorkspaceCompletedMission[]>([])
  const [activeThoughts, setActiveThoughts] = useState<Thought[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workspaceId) {
      setCompletedMissions([])
      setActiveThoughts([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      const supabase = createClient()

      const [completedRes, activeThoughtsRes] = await Promise.all([
        supabase
          .from('workspace_missions')
          .select('*, workspace_mission_thoughts(*)')
          .eq('workspace_id', workspaceId)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false }),
        activeMissionId
          ? supabase
              .from('workspace_mission_thoughts')
              .select('*')
              .eq('workspace_mission_id', activeMissionId)
              .order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
      ])

      if (cancelled) return

      if (completedRes.error) toast.error(getT().errors.loadJournal)

      const completed: WorkspaceCompletedMission[] = (completedRes.data ?? []).map((row) => ({
        id: row.id,
        workspaceId: row.workspace_id,
        name: row.name,
        target: row.target,
        tasksCompleted: row.tasks_completed ?? 0,
        startedAt: row.started_at,
        completedAt: row.completed_at!,
        deadline: row.deadline ?? undefined,
        moneyGoal: row.money_goal ?? undefined,
        thoughts: (row.workspace_mission_thoughts ?? []).map(rowToThought),
      }))

      setCompletedMissions(completed)
      setActiveThoughts((activeThoughtsRes.data ?? []).map(rowToThought))
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [workspaceId, activeMissionId])

  const addThought = useCallback(async (text: string) => {
    if (!activeMissionId) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('workspace_mission_thoughts')
      .insert({ workspace_mission_id: activeMissionId, user_id: user.id, text })
      .select()
      .single()

    if (error) { toast.error(getT().errors.addThought); return }
    if (data) setActiveThoughts(prev => [rowToThought(data), ...prev])
  }, [activeMissionId])

  const deleteThought = useCallback(async (thoughtId: string) => {
    const snapshot = activeThoughts
    setActiveThoughts(prev => prev.filter(t => t.id !== thoughtId))
    const supabase = createClient()
    const { error } = await supabase.from('workspace_mission_thoughts').delete().eq('id', thoughtId)
    if (error) { toast.error(getT().errors.deleteThought); setActiveThoughts(snapshot) }
  }, [activeThoughts])

  const getThoughtsForMission = useCallback((missionId: string): Thought[] => {
    if (missionId === activeMissionId) return activeThoughts
    return completedMissions.find(m => m.id === missionId)?.thoughts ?? []
  }, [activeMissionId, activeThoughts, completedMissions])

  const getWeeklySummary = useCallback(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoISO = weekAgo.toISOString()
    const recent = completedMissions.filter(m => m.completedAt >= weekAgoISO)
    return {
      missionsCount: recent.length,
      totalTasks: recent.reduce((sum, m) => sum + m.tasksCompleted, 0),
    }
  }, [completedMissions])

  return { completedMissions, activeThoughts, loading, addThought, deleteThought, getThoughtsForMission, getWeeklySummary }
}
