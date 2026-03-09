'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getT } from '@/lib/i18n'
import type { WorkspaceMission, MissionGoal } from '@/lib/types'

export function useWorkspaceMission(workspaceId: string | null) {
  const [activeMission, setActiveMission] = useState<WorkspaceMission | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workspaceId) {
      setActiveMission(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('workspace_missions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!cancelled) {
        if (error) toast.error(getT().errors.loadMission)
        setActiveMission(data as WorkspaceMission | null)
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [workspaceId])

  const saveMission = useCallback(async (draft: MissionGoal) => {
    if (!workspaceId) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      workspace_id: workspaceId,
      name: draft.name,
      target: draft.target,
      started_at: draft.startedAt ?? activeMission?.started_at ?? new Date().toISOString(),
      deadline: draft.deadline ?? null,
      money_goal: draft.moneyGoal ?? null,
      money_balance: draft.moneyBalance ?? null,
      created_by: user.id,
    }

    if (activeMission) {
      const { data, error } = await supabase
        .from('workspace_missions')
        .update(payload)
        .eq('id', activeMission.id)
        .select()
        .single()
      if (error) toast.error(getT().errors.saveMission)
      else setActiveMission(data as WorkspaceMission)
    } else {
      const { data, error } = await supabase
        .from('workspace_missions')
        .insert(payload)
        .select()
        .single()
      if (error) toast.error(getT().errors.createMission)
      else setActiveMission(data as WorkspaceMission)
    }
  }, [workspaceId, activeMission])

  const completeMission = useCallback(async (
    name: string,
    target: number,
    tasksCompleted: number,
    startedAt: string,
    deadline?: string,
    moneyGoal?: number,
  ) => {
    if (!activeMission || !workspaceId) return
    const supabase = createClient()

    const { error } = await supabase
      .from('workspace_missions')
      .update({
        completed_at: new Date().toISOString(),
        tasks_completed: tasksCompleted,
      })
      .eq('id', activeMission.id)

    if (error) {
      toast.error(getT().errors.completeMission)
      return
    }
    setActiveMission(null)
  }, [activeMission, workspaceId])

  return { activeMission, loading, saveMission, completeMission }
}
