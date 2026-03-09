'use client'

import { useState, useCallback } from 'react'
import { Users, Copy, RefreshCw, LogOut, Plus, ChevronDown, Check, Send, Target } from 'lucide-react'
import { useWorkspace } from '@/lib/hooks/use-workspace'
import { useWorkspaceTasks } from '@/lib/hooks/use-workspace-tasks'
import { useWorkspaceMission } from '@/lib/hooks/use-workspace-mission'
import { GlassCard } from '@/components/dashboard/glass-card'
import { BentoGrid } from '@/components/dashboard/bento-grid'
import { HeroTile } from '@/components/dashboard/tiles/hero-tile'
import { TaskTile } from '@/components/dashboard/tiles/task-tile'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { MissionGoal, Workspace, WorkspaceMember, WorkspaceInvite } from '@/lib/types'

// ── No-workspace empty state ─────────────────────────────────────────────────

function NoWorkspaceScreen({ onCreateClick, onJoinClick }: { onCreateClick: () => void; onJoinClick: () => void }) {
  const t = useTranslations()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
      <div className="glass rounded-full p-6">
        <Users className="h-10 w-10 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-foreground">{t.workspace.noWorkspace}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t.workspace.noWorkspaceSub}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button type="button" onClick={onCreateClick}
          className="glass-button-primary flex-1 rounded-2xl px-4 py-3 text-sm font-medium">
          {t.workspace.create}
        </button>
        <button type="button" onClick={onJoinClick}
          className="glass-button flex-1 rounded-2xl px-4 py-3 text-sm font-medium text-foreground">
          {t.workspace.join}
        </button>
      </div>
    </div>
  )
}

// ── Create workspace modal ────────────────────────────────────────────────────

function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => Promise<boolean> }) {
  const t = useTranslations()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || loading) return
    setLoading(true)
    const ok = await onCreate(name.trim())
    setLoading(false)
    if (ok) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="glass rounded-bento p-6 w-full max-w-sm space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t.workspace.create}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ws-name" className="text-xs text-muted-foreground mb-1.5 block">{t.workspace.nameLabel}</label>
            <Input id="ws-name" placeholder={t.workspace.namePlaceholder} value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-button text-sm border-0 rounded-2xl px-4 py-3 h-auto focus-visible:ring-primary/30" autoFocus />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="glass-button flex-1 rounded-2xl px-4 py-3 text-sm font-medium text-foreground">
              {t.workspace.cancel}
            </button>
            <button type="submit" disabled={!name.trim() || loading}
              className="glass-button-primary flex-1 rounded-2xl px-4 py-3 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? t.workspace.creating : t.workspace.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Join workspace modal ──────────────────────────────────────────────────────

function JoinModal({ onClose, onJoin }: { onClose: () => void; onJoin: (code: string) => Promise<boolean> }) {
  const t = useTranslations()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.trim().length < 6 || loading) return
    setLoading(true)
    const ok = await onJoin(code.trim())
    setLoading(false)
    if (ok) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="glass rounded-bento p-6 w-full max-w-sm space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t.workspace.join}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ws-code" className="text-xs text-muted-foreground mb-1.5 block">{t.workspace.joinCodeLabel}</label>
            <Input id="ws-code" placeholder={t.workspace.joinCodePlaceholder}
              value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="glass-button text-sm border-0 rounded-2xl px-4 py-3 h-auto focus-visible:ring-primary/30 tracking-widest font-mono"
              maxLength={6} autoFocus />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="glass-button flex-1 rounded-2xl px-4 py-3 text-sm font-medium text-foreground">
              {t.workspace.cancel}
            </button>
            <button type="submit" disabled={code.trim().length < 6 || loading}
              className="glass-button-primary flex-1 rounded-2xl px-4 py-3 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? t.workspace.joining : t.workspace.join}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Member row ────────────────────────────────────────────────────────────────

function MemberRow({ member }: { member: WorkspaceMember }) {
  const t = useTranslations()
  const name = member.profile?.full_name ?? '?'
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-full glass flex items-center justify-center text-sm font-semibold text-foreground shrink-0 overflow-hidden">
        {member.profile?.avatar_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={member.profile.avatar_url} alt={name} className="h-9 w-9 object-cover" />
          : initials}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{t.workspace.roles[member.role]}</p>
      </div>
    </div>
  )
}

// ── Workspace quick-add task ──────────────────────────────────────────────────

function WorkspaceQuickAdd({
  onAdd, missionActive,
}: {
  onAdd: (d: { title: string; description?: string; status: 'todo'; priority: 'medium' }) => Promise<void>
  missionActive: boolean
}) {
  const t = useTranslations()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || loading || !missionActive) return
    setLoading(true)
    try {
      await onAdd({ title: title.trim(), description: description.trim() || undefined, status: 'todo', priority: 'medium' })
      setTitle('')
      setDescription('')
    } finally {
      setLoading(false)
    }
  }

  if (!missionActive) {
    return (
      <GlassCard className="bento-1x1 flex flex-col items-center justify-center gap-3">
        <Target className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground text-center">{t.tasks.setMissionFirst}<br />{t.tasks.setMissionSub}</p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="bento-1x1 flex flex-col">
      <h2 className="font-semibold text-foreground mb-4">{t.tasks.newTaskHeading}</h2>
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
        <div className="flex-1 flex flex-col justify-center gap-4">
          <div>
            <label htmlFor="ws-task-title" className="text-xs text-muted-foreground mb-1.5 block">{t.tasks.whatLabel}</label>
            <Input id="ws-task-title" placeholder={t.tasks.whatPlaceholder} value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-button text-sm border-0 rounded-2xl px-4 py-3 h-auto focus-visible:ring-primary/30" disabled={loading} />
          </div>
          <div>
            <label htmlFor="ws-task-desc" className="text-xs text-muted-foreground mb-1.5 block">{t.tasks.whyLabel}</label>
            <Input id="ws-task-desc" placeholder={t.tasks.whyPlaceholder} value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-button text-sm border-0 rounded-2xl px-4 py-3 h-auto focus-visible:ring-primary/30" disabled={loading} />
          </div>
        </div>
        <button type="submit" disabled={loading || !title.trim()}
          className="glass-button-primary w-full rounded-2xl px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          <Send className="h-4 w-4" />
          {t.tasks.addTask}
        </button>
      </form>
    </GlassCard>
  )
}

// ── Main workspace view ───────────────────────────────────────────────────────

function WorkspaceView({
  activeWorkspace, workspaces, members, invite, activeWorkspaceId,
  onSwitchWorkspace, onRegenerateInvite, onLeaveWorkspace,
  onShowCreate, onShowJoin,
}: {
  activeWorkspace: Workspace
  workspaces: Workspace[]
  members: WorkspaceMember[]
  invite: WorkspaceInvite | null
  activeWorkspaceId: string
  onSwitchWorkspace: (id: string) => void
  onRegenerateInvite: () => void
  onLeaveWorkspace: (id: string) => void
  onShowCreate: () => void
  onShowJoin: () => void
}) {
  const t = useTranslations()
  const { tasks, createTask, changeStatus, deleteTask } = useWorkspaceTasks(activeWorkspace.id)
  const { activeMission, saveMission, completeMission } = useWorkspaceMission(activeWorkspace.id)

  const [copied, setCopied] = useState(false)
  const [missionActive, setMissionActive] = useState(false)
  const [showSwitcher, setShowSwitcher] = useState(false)

  const doneTasks = tasks.filter(task => task.status === 'done')

  const missionAsGoal: MissionGoal | null = activeMission
    ? {
        name: activeMission.name,
        target: activeMission.target,
        startedAt: activeMission.started_at,
        deadline: activeMission.deadline ?? undefined,
        moneyGoal: activeMission.money_goal ?? undefined,
        moneyBalance: activeMission.money_balance ?? undefined,
      }
    : null

  const handleMissionChange = useCallback((active: boolean) => setMissionActive(active), [])

  async function handleCopy() {
    if (!invite?.code) return
    await navigator.clipboard.writeText(invite.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <button type="button" onClick={() => setShowSwitcher(s => !s)}
          className="flex items-center gap-1.5 text-sm font-semibold text-foreground glass-button rounded-full px-3 py-1.5">
          {activeWorkspace.name}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <div className="flex -space-x-2">
          {members.slice(0, 4).map(m => {
            const name = m.profile?.full_name ?? '?'
            const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div key={m.user_id} className="h-9 w-9 rounded-full glass ring-2 ring-background flex items-center justify-center text-xs font-semibold overflow-hidden">
                {m.profile?.avatar_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={m.profile.avatar_url} alt={name} className="h-9 w-9 object-cover" />
                  : initials}
              </div>
            )
          })}
          {members.length > 4 && (
            <div className="h-9 w-9 rounded-full glass ring-2 ring-background flex items-center justify-center text-xs font-medium text-muted-foreground">
              +{members.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Switcher dropdown */}
      {showSwitcher && (
        <GlassCard className="py-2 space-y-0.5">
          {workspaces.map(ws => (
            <button key={ws.id} type="button"
              onClick={() => { onSwitchWorkspace(ws.id); setShowSwitcher(false) }}
              className={cn(
                'w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between',
                ws.id === activeWorkspaceId ? 'text-primary font-medium' : 'text-foreground hover:bg-white/5'
              )}>
              {ws.name}
              {ws.id === activeWorkspaceId && <Check className="h-4 w-4" />}
            </button>
          ))}
          <div className="border-t border-white/10 mt-1 pt-1 flex gap-1">
            <button type="button" onClick={() => { setShowSwitcher(false); onShowCreate() }}
              className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
              <Plus className="h-3.5 w-3.5" />{t.workspace.create}
            </button>
            <button type="button" onClick={() => { setShowSwitcher(false); onShowJoin() }}
              className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
              <Users className="h-3.5 w-3.5" />{t.workspace.join}
            </button>
          </div>
        </GlassCard>
      )}

      {/* Bento grid */}
      <BentoGrid>
        <HeroTile
          total={tasks.length}
          done={doneTasks.length}
          activeMission={missionAsGoal}
          onMissionSave={saveMission}
          onMissionChange={handleMissionChange}
          onMissionComplete={completeMission}
        />
        <WorkspaceQuickAdd onAdd={createTask} missionActive={missionActive} />
        {tasks.map(task => (
          <TaskTile key={task.id} task={task} onStatusChange={changeStatus} onDelete={deleteTask} />
        ))}
      </BentoGrid>

      {/* Members */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-foreground mb-3">{t.workspace.members}</h3>
        <div className="space-y-3">
          {members.map(m => <MemberRow key={m.user_id} member={m} />)}
        </div>
      </GlassCard>

      {/* Invite code */}
      {invite && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-foreground mb-3">{t.workspace.inviteCode}</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 glass-button rounded-2xl px-4 py-3 font-mono text-lg tracking-widest font-bold text-foreground text-center">
              {invite.code}
            </div>
            <button type="button" onClick={handleCopy}
              className="glass-button rounded-2xl px-4 py-3 text-sm font-medium text-foreground flex items-center gap-2 shrink-0">
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              {copied ? t.workspace.codeCopied : t.workspace.copyCode}
            </button>
          </div>
          <button type="button" onClick={onRegenerateInvite}
            className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="h-3 w-3" />{t.workspace.regenerate}
          </button>
        </GlassCard>
      )}

      {/* Leave */}
      <div className="pb-24 flex justify-center">
        <button type="button" onClick={() => onLeaveWorkspace(activeWorkspace.id)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="h-3.5 w-3.5" />{t.workspace.leave}
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  const {
    workspaces, activeWorkspace, activeWorkspaceId, members, invite, loading,
    createWorkspace, joinWorkspace, switchWorkspace, regenerateInvite, leaveWorkspace,
  } = useWorkspace()

  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40 rounded-full" />
        <div className="bento-grid">
          <Skeleton className="rounded-bento bento-1x1" />
          <Skeleton className="rounded-bento bento-1x1" />
        </div>
      </div>
    )
  }

  return (
    <>
      {!activeWorkspace ? (
        <NoWorkspaceScreen onCreateClick={() => setShowCreate(true)} onJoinClick={() => setShowJoin(true)} />
      ) : (
        <WorkspaceView
          activeWorkspace={activeWorkspace}
          workspaces={workspaces}
          members={members}
          invite={invite}
          activeWorkspaceId={activeWorkspaceId!}
          onSwitchWorkspace={switchWorkspace}
          onRegenerateInvite={regenerateInvite}
          onLeaveWorkspace={leaveWorkspace}
          onShowCreate={() => setShowCreate(true)}
          onShowJoin={() => setShowJoin(true)}
        />
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={createWorkspace} />}
      {showJoin && <JoinModal onClose={() => setShowJoin(false)} onJoin={joinWorkspace} />}
    </>
  )
}
