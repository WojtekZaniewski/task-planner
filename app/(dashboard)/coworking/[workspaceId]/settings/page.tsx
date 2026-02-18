'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, Link as LinkIcon, Loader2, ArrowLeft, Trash2, UserMinus } from 'lucide-react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import type { Workspace, WorkspaceMember, WorkspaceInvite } from '@/lib/types'
import Link from 'next/link'

export default function WorkspaceSettings() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.workspaceId as string
  const supabase = createClient()

  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [invites, setInvites] = useState<WorkspaceInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    fetchData()
  }, [workspaceId])

  async function fetchData() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)

    const [wsRes, membersRes, invitesRes] = await Promise.all([
      supabase.from('workspaces').select('*').eq('id', workspaceId).single(),
      supabase
        .from('workspace_members')
        .select('*, profile:profiles(id, full_name, avatar_url)')
        .eq('workspace_id', workspaceId),
      supabase
        .from('workspace_invites')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false }),
    ])

    setWorkspace(wsRes.data)
    setMembers(membersRes.data ?? [])
    setInvites(invitesRes.data ?? [])
    setLoading(false)
  }

  async function generateInviteLink() {
    setGenerating(true)
    const code = nanoid(10)

    const { error } = await supabase.from('workspace_invites').insert({
      workspace_id: workspaceId,
      code,
      created_by: currentUserId,
    })

    if (error) {
      toast.error('Nie udało się wygenerować linku')
      console.error(error)
    } else {
      const url = `${window.location.origin}/coworking/join/${code}`
      await navigator.clipboard.writeText(url)
      toast.success('Link skopiowany do schowka!')
      fetchData()
    }
    setGenerating(false)
  }

  async function copyInviteLink(code: string) {
    const url = `${window.location.origin}/coworking/join/${code}`
    await navigator.clipboard.writeText(url)
    toast.success('Link skopiowany!')
  }

  async function deleteInvite(inviteId: string) {
    const { error } = await supabase
      .from('workspace_invites')
      .delete()
      .eq('id', inviteId)

    if (error) {
      toast.error('Nie udało się usunąć zaproszenia')
    } else {
      toast.success('Zaproszenie usunięte')
      fetchData()
    }
  }

  async function removeMember(userId: string) {
    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)

    if (error) {
      toast.error('Nie udało się usunąć członka')
    } else {
      toast.success('Członek usunięty')
      fetchData()
    }
  }

  const isOwner = workspace?.owner_id === currentUserId

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!workspace) {
    return <p className="py-20 text-center text-muted-foreground">Workspace nie znaleziony</p>
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/coworking/${workspaceId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Ustawienia</h1>
          <p className="text-sm text-muted-foreground">{workspace.name}</p>
        </div>
      </div>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Członkowie</CardTitle>
          <CardDescription>
            {members.length} {members.length === 1 ? 'osoba' : 'osób'} w workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((m: any) => (
            <div key={m.user_id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {m.profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {m.profile?.full_name || 'Nieznany'}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {m.role === 'owner'
                      ? 'Właściciel'
                      : m.role === 'admin'
                      ? 'Admin'
                      : 'Członek'}
                  </Badge>
                </div>
              </div>
              {isOwner && m.user_id !== currentUserId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeMember(m.user_id)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Invite links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Zaproszenia</CardTitle>
          <CardDescription>
            Wygeneruj link zaproszeniowy dla współpracowników
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={generateInviteLink} disabled={generating}>
            {generating ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LinkIcon className="h-4 w-4" />
            )}
            Wygeneruj nowy link
          </Button>

          {invites.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                {invites.map((inv) => {
                  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/coworking/join/${inv.code}`
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-mono">{url}</p>
                        <p className="text-xs text-muted-foreground">
                          Użyto: {inv.use_count} razy
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyInviteLink(inv.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteInvite(inv.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
