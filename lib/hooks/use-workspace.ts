'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getT } from '@/lib/i18n'
import type { Workspace, WorkspaceMember, WorkspaceInvite } from '@/lib/types'

const STORAGE_KEY = 'task-planner-workspace'

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function loadActiveId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

export function useWorkspace() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null)
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [invite, setInvite] = useState<WorkspaceInvite | null>(null)
  const [loading, setLoading] = useState(true)

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) ?? null

  // Load member profiles for the active workspace
  const loadMembers = useCallback(async (workspaceId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('workspace_members')
      .select('workspace_id, user_id, role, joined_at, profile:profiles(id, full_name, avatar_url, created_at)')
      .eq('workspace_id', workspaceId)
    setMembers((data as unknown as WorkspaceMember[]) ?? [])
  }, [])

  // Load invite code for active workspace
  const loadInvite = useCallback(async (workspaceId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('workspace_invites')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setInvite(data as WorkspaceInvite | null)
  }, [])

  // Initial load
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const supabase = createClient()

      const { data } = await supabase
        .from('workspace_members')
        .select('workspace_id, workspaces(*)')
        .order('joined_at', { ascending: true })

      if (cancelled) return

      const loaded: Workspace[] = (data ?? []).map((row: { workspaces: unknown }) => row.workspaces as Workspace).filter(Boolean)
      setWorkspaces(loaded)

      const savedId = loadActiveId()
      const resolvedId = loaded.find(w => w.id === savedId)?.id ?? loaded[0]?.id ?? null
      setActiveWorkspaceId(resolvedId)

      if (resolvedId) {
        await Promise.all([loadMembers(resolvedId), loadInvite(resolvedId)])
      }

      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [loadMembers, loadInvite])

  const switchWorkspace = useCallback(async (id: string) => {
    setActiveWorkspaceId(id)
    localStorage.setItem(STORAGE_KEY, id)
    await Promise.all([loadMembers(id), loadInvite(id)])
  }, [loadMembers, loadInvite])

  const createWorkspace = useCallback(async (name: string): Promise<boolean> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const wsId = crypto.randomUUID()
    const { error: wsError } = await supabase
      .from('workspaces')
      .insert({ id: wsId, name: name.trim(), owner_id: user.id })

    if (wsError) {
      toast.error(getT().workspace.errorCreate)
      return false
    }

    const newWs: Workspace = {
      id: wsId,
      name: name.trim(),
      description: null,
      owner_id: user.id,
      created_at: new Date().toISOString(),
    }

    // Add owner as member
    await supabase.from('workspace_members').insert({
      workspace_id: newWs.id,
      user_id: user.id,
      role: 'owner',
    })

    // Create invite code
    const code = generateCode()
    const { data: inv } = await supabase
      .from('workspace_invites')
      .insert({ workspace_id: newWs.id, code, created_by: user.id })
      .select()
      .single()

    setWorkspaces(prev => [...prev, newWs])
    setActiveWorkspaceId(newWs.id)
    localStorage.setItem(STORAGE_KEY, newWs.id)
    setInvite(inv as WorkspaceInvite)
    await loadMembers(newWs.id)
    return true
  }, [loadMembers])

  const joinWorkspace = useCallback(async (code: string): Promise<boolean> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data: inv } = await supabase
      .from('workspace_invites')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle()

    if (!inv) {
      toast.error(getT().workspace.invalidCode)
      return false
    }

    // Check not already a member
    const { data: existing } = await supabase
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', inv.workspace_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existing) {
      const { error } = await supabase.from('workspace_members').insert({
        workspace_id: inv.workspace_id,
        user_id: user.id,
        role: 'member',
      })
      if (error) {
        toast.error(getT().workspace.errorJoin)
        return false
      }
      // Increment use_count
      await supabase
        .from('workspace_invites')
        .update({ use_count: (inv.use_count ?? 0) + 1 })
        .eq('id', inv.id)
    }

    // Load the workspace
    const { data: ws } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', inv.workspace_id)
      .single()

    if (ws) {
      const newWs = ws as Workspace
      setWorkspaces(prev => prev.find(w => w.id === newWs.id) ? prev : [...prev, newWs])
      setActiveWorkspaceId(newWs.id)
      localStorage.setItem(STORAGE_KEY, newWs.id)
      setInvite(inv as WorkspaceInvite)
      await loadMembers(newWs.id)
    }
    return true
  }, [loadMembers])

  const regenerateInvite = useCallback(async () => {
    if (!activeWorkspaceId) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const code = generateCode()
    const { data } = await supabase
      .from('workspace_invites')
      .insert({ workspace_id: activeWorkspaceId, code, created_by: user.id })
      .select()
      .single()

    if (data) setInvite(data as WorkspaceInvite)
  }, [activeWorkspaceId])

  const leaveWorkspace = useCallback(async (workspaceId: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)

    const updated = workspaces.filter(w => w.id !== workspaceId)
    setWorkspaces(updated)

    if (activeWorkspaceId === workspaceId) {
      const next = updated[0]?.id ?? null
      setActiveWorkspaceId(next)
      if (next) {
        localStorage.setItem(STORAGE_KEY, next)
        await Promise.all([loadMembers(next), loadInvite(next)])
      } else {
        localStorage.removeItem(STORAGE_KEY)
        setMembers([])
        setInvite(null)
      }
    }
  }, [workspaces, activeWorkspaceId, loadMembers, loadInvite])

  return {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    members,
    invite,
    loading,
    createWorkspace,
    joinWorkspace,
    switchWorkspace,
    regenerateInvite,
    leaveWorkspace,
  }
}
