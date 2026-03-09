'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getT } from '@/lib/i18n'
import type { CompletedMission, MissionGoal, MissionRow, MissionThoughtRow, Thought } from '@/lib/types'

function rowToThought(row: MissionThoughtRow): Thought {
  return { id: row.id, text: row.text, createdAt: row.created_at, missionId: row.mission_id }
}

function rowToCompleted(row: MissionRow & { mission_thoughts: MissionThoughtRow[] }): CompletedMission {
  return {
    id: row.id,
    name: row.name,
    target: row.target,
    tasksCompleted: row.tasks_completed ?? 0,
    startedAt: row.started_at,
    completedAt: row.completed_at!,
    deadline: row.deadline ?? undefined,
    moneyGoal: row.money_goal ?? undefined,
    thoughts: (row.mission_thoughts ?? []).map(rowToThought),
  }
}

export function useJournal() {
  const [activeMission, setActiveMission] = useState<MissionGoal | null>(null)
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null)
  const [completedMissions, setCompletedMissions] = useState<CompletedMission[]>([])
  const [activeThoughts, setActiveThoughts] = useState<Thought[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const supabase = createClient()

      const [activeRes, completedRes] = await Promise.all([
        supabase.from('missions').select('*').is('completed_at', null).maybeSingle(),
        supabase
          .from('missions')
          .select('*, mission_thoughts(*)')
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false }),
      ])

      if (cancelled) return

      if (activeRes.error) toast.error(getT().errors.loadMission)
      if (completedRes.error) toast.error(getT().errors.loadJournal)

      const activeRow = activeRes.data as MissionRow | null

      if (activeRow) {
        setActiveMissionId(activeRow.id)
        setActiveMission({
          name: activeRow.name,
          target: activeRow.target,
          startedAt: activeRow.started_at,
          deadline: activeRow.deadline ?? undefined,
          moneyGoal: activeRow.money_goal ?? undefined,
          moneyBalance: activeRow.money_balance ?? undefined,
        })

        // Load active thoughts
        const { data: thoughtsData } = await supabase
          .from('mission_thoughts')
          .select('*')
          .eq('mission_id', activeRow.id)
          .order('created_at', { ascending: false })

        if (!cancelled) {
          setActiveThoughts((thoughtsData ?? []).map(rowToThought))
        }
      } else {
        setActiveMissionId(null)
        setActiveMission(null)
        setActiveThoughts([])
      }

      const completedRows = (completedRes.data ?? []) as (MissionRow & { mission_thoughts: MissionThoughtRow[] })[]
      setCompletedMissions(completedRows.map(rowToCompleted))
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [])

  const saveMission = useCallback(async (draft: MissionGoal) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (activeMissionId) {
      // Update existing active mission
      const { error } = await supabase
        .from('missions')
        .update({
          name: draft.name,
          target: draft.target,
          deadline: draft.deadline || null,
          money_goal: draft.moneyGoal || null,
          money_balance: draft.moneyBalance || null,
        })
        .eq('id', activeMissionId)

      if (error) { toast.error(getT().errors.saveMission); return }
    } else {
      // Insert new active mission
      const { data: created, error } = await supabase
        .from('missions')
        .insert({
          user_id: user.id,
          name: draft.name,
          target: draft.target,
          deadline: draft.deadline || null,
          money_goal: draft.moneyGoal || null,
          money_balance: draft.moneyBalance || null,
        })
        .select()
        .single()

      if (error) { toast.error(getT().errors.createMission); return }
      if (created) setActiveMissionId(created.id)
    }

    setActiveMission({ ...draft })
  }, [activeMissionId])

  const archiveMission = useCallback(async (
    name: string,
    target: number,
    tasksCompleted: number,
    startedAt: string,
    deadline?: string,
    moneyGoal?: number,
  ) => {
    if (!activeMissionId) return

    const supabase = createClient()
    const now = new Date().toISOString()

    const { error } = await supabase
      .from('missions')
      .update({ completed_at: now, tasks_completed: tasksCompleted })
      .eq('id', activeMissionId)
      .is('completed_at', null)

    if (error) { toast.error(getT().errors.completeMission); return }

    const archived: CompletedMission = {
      id: activeMissionId,
      name,
      target,
      tasksCompleted,
      startedAt,
      completedAt: now,
      deadline,
      moneyGoal,
      thoughts: activeThoughts,
    }

    setCompletedMissions(prev => [archived, ...prev])
    setActiveMission(null)
    setActiveMissionId(null)
    setActiveThoughts([])
  }, [activeMissionId, activeThoughts])

  const addThought = useCallback(async (text: string) => {
    if (!activeMissionId) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('mission_thoughts')
      .insert({ mission_id: activeMissionId, user_id: user.id, text })
      .select()
      .single()

    if (error) { toast.error(getT().errors.addThought); return }
    if (data) setActiveThoughts(prev => [rowToThought(data), ...prev])
  }, [activeMissionId])

  const deleteThought = useCallback(async (thoughtId: string) => {
    const snapshot = activeThoughts
    setActiveThoughts(prev => prev.filter(t => t.id !== thoughtId))
    const supabase = createClient()
    const { error } = await supabase.from('mission_thoughts').delete().eq('id', thoughtId)
    if (error) { toast.error(getT().errors.deleteThought); setActiveThoughts(snapshot) }
  }, [activeThoughts])

  const getThoughtsForMission = useCallback((missionId: string): Thought[] => {
    if (missionId === activeMissionId) return activeThoughts
    const mission = completedMissions.find(m => m.id === missionId)
    return mission?.thoughts ?? []
  }, [activeMissionId, activeThoughts, completedMissions])

  const getWeeklySummary = useCallback(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoISO = weekAgo.toISOString()
    const recentMissions = completedMissions.filter(m => m.completedAt >= weekAgoISO)
    return {
      missions: recentMissions,
      missionsCount: recentMissions.length,
      totalTasks: recentMissions.reduce((sum, m) => sum + m.tasksCompleted, 0),
    }
  }, [completedMissions])

  return {
    activeMission,
    activeMissionId,
    completedMissions,
    activeThoughts,
    thoughts: activeThoughts,
    loading,
    saveMission,
    archiveMission,
    addThought,
    deleteThought,
    getThoughtsForMission,
    getWeeklySummary,
  }
}
