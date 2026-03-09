'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, CheckCircle2, Clock, MessageSquare, Trophy, Trash2 } from 'lucide-react'
import { GlassCard } from '@/components/dashboard/glass-card'
import { BentoGrid } from '@/components/dashboard/bento-grid'
import { useWorkspace } from '@/lib/hooks/use-workspace'
import { useWorkspaceMission } from '@/lib/hooks/use-workspace-mission'
import { useWorkspaceJournal } from '@/lib/hooks/use-workspace-journal'
import { Progress } from '@/components/ui/progress'
import { format, differenceInDays, parseISO } from 'date-fns'
import { useTranslations } from '@/lib/i18n'
import type { WorkspaceCompletedMission, Thought } from '@/lib/types'

export default function WorkspaceJournalPage() {
  const router = useRouter()
  const t = useTranslations()
  const { activeWorkspace } = useWorkspace()
  const { activeMission } = useWorkspaceMission(activeWorkspace?.id ?? null)
  const { completedMissions, activeThoughts, loading, deleteThought, getThoughtsForMission, getWeeklySummary } =
    useWorkspaceJournal(activeWorkspace?.id ?? null, activeMission?.id ?? null)

  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="bento-grid">
        <div className="glass rounded-bento bento-1x1 animate-pulse" />
        <div className="glass rounded-bento bento-1x1 animate-pulse" />
      </div>
    )
  }

  const weekly = getWeeklySummary()

  if (selectedId) {
    if (selectedId === 'active' && activeMission) {
      return (
        <ActiveMissionDetail
          missionName={activeMission.name}
          target={activeMission.target}
          startedAt={activeMission.started_at}
          deadline={activeMission.deadline ?? undefined}
          moneyGoal={activeMission.money_goal ?? undefined}
          thoughts={activeThoughts}
          onBack={() => setSelectedId(null)}
          onDeleteThought={deleteThought}
        />
      )
    }
    const mission = completedMissions.find(m => m.id === selectedId)
    if (mission) {
      return (
        <MissionDetail
          mission={mission}
          thoughts={getThoughtsForMission(mission.id)}
          onBack={() => setSelectedId(null)}
        />
      )
    }
  }

  const activePercentage = activeMission
    ? Math.min(100, Math.round(((activeMission.tasks_completed ?? 0) / activeMission.target) * 100))
    : 0
  const activeDaysLeft = activeMission?.deadline
    ? differenceInDays(parseISO(activeMission.deadline), new Date())
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={t.journal.backToDashboard}
          onClick={() => router.push('/workspace')}
          className="glass-button flex h-9 w-9 items-center justify-center rounded-full"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">{t.workspace.journalTitle}</h1>
      </div>

      {/* Active mission */}
      {activeMission && (
        <div
          className="glass rounded-bento p-5 glass-hover glow-orange cursor-pointer"
          onClick={() => setSelectedId('active')}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">{activeMission.name}</p>
            <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5 shrink-0">
              {t.journal.inProgress}
            </span>
          </div>
          <Progress value={activePercentage} className="h-1.5 mb-2" />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{t.journal.tasksOf(activeMission.tasks_completed ?? 0, activeMission.target)}</p>
            {activeDaysLeft !== null && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground glass-subtle rounded-full px-2.5 py-1">
                <Clock className="h-3 w-3" />
                {activeDaysLeft > 0
                  ? t.journal.daysShort(activeDaysLeft)
                  : activeDaysLeft === 0
                  ? t.journal.deadlineToday
                  : t.journal.pastDeadline}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Weekly summary */}
      <GlassCard className="flex items-center gap-4" hover={false}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
          <Trophy className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{t.journal.weeklyTitle}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {weekly.missionsCount === 0
              ? t.journal.weeklyEmpty
              : t.journal.weeklyStats(weekly.missionsCount, weekly.totalTasks)}
          </p>
        </div>
      </GlassCard>

      {/* Completed missions */}
      {completedMissions.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-12 gap-3" hover={false}>
          <Calendar className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground text-center">{t.journal.noCompleted}</p>
        </GlassCard>
      ) : (
        <BentoGrid>
          {completedMissions.map(m => {
            const days = differenceInDays(parseISO(m.completedAt), parseISO(m.startedAt))
            return (
              <GlassCard
                key={m.id}
                className="bento-1x1 flex flex-col justify-between cursor-pointer"
                hover
              >
                <div onClick={() => setSelectedId(m.id)} className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(parseISO(m.completedAt), 'd MMMM yyyy', { locale: t.dateLocale })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground glass-subtle rounded-full px-2.5 py-1">
                      <Clock className="h-3 w-3" />
                      {t.journal.durationDays(days)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground glass-subtle rounded-full px-2.5 py-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {t.journal.tasksCount(m.tasksCompleted)}
                    </span>
                    {m.thoughts.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-primary glass-subtle rounded-full px-2.5 py-1">
                        <MessageSquare className="h-3 w-3" />
                        {m.thoughts.length}
                      </span>
                    )}
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </BentoGrid>
      )}
    </div>
  )
}

// ── Active mission detail ─────────────────────────────────────────────────────

function ActiveMissionDetail({
  missionName, target, startedAt, deadline, moneyGoal,
  thoughts, onBack, onDeleteThought,
}: {
  missionName: string
  target: number
  startedAt: string
  deadline?: string
  moneyGoal?: number
  thoughts: Thought[]
  onBack: () => void
  onDeleteThought: (id: string) => void
}) {
  const t = useTranslations()
  const days = differenceInDays(new Date(), parseISO(startedAt))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button type="button" aria-label={t.journal.backToJournal} onClick={onBack} className="glass-button flex h-9 w-9 items-center justify-center rounded-full">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">{missionName}</h1>
          <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5">{t.journal.inProgress}</span>
        </div>
      </div>

      <GlassCard hover={false}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{t.journal.durationOngoing}</p>
            <p className="text-lg font-bold text-foreground">{t.journal.durationDays(days)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.journal.tasksLabel}</p>
            <p className="text-lg font-bold text-foreground">— / {target}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.journal.startedLabel}</p>
            <p className="text-sm font-medium text-foreground">
              {format(parseISO(startedAt), 'd MMM yyyy', { locale: t.dateLocale })}
            </p>
          </div>
          {deadline && (
            <div>
              <p className="text-xs text-muted-foreground">{t.journal.deadlineLabel}</p>
              <p className="text-sm font-medium text-foreground">
                {format(parseISO(deadline), 'd MMM yyyy', { locale: t.dateLocale })}
              </p>
            </div>
          )}
          {moneyGoal && (
            <div>
              <p className="text-xs text-muted-foreground">{t.journal.moneyGoalLabel}</p>
              <p className="text-sm font-medium text-foreground">{moneyGoal.toLocaleString()}</p>
            </div>
          )}
        </div>
      </GlassCard>

      <ThoughtsSection thoughts={thoughts} onDelete={onDeleteThought} />
    </div>
  )
}

// ── Completed mission detail ──────────────────────────────────────────────────

function MissionDetail({ mission, thoughts, onBack }: {
  mission: WorkspaceCompletedMission
  thoughts: Thought[]
  onBack: () => void
}) {
  const t = useTranslations()
  const days = differenceInDays(parseISO(mission.completedAt), parseISO(mission.startedAt))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button type="button" aria-label={t.journal.backToJournal} onClick={onBack} className="glass-button flex h-9 w-9 items-center justify-center rounded-full">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">{mission.name}</h1>
      </div>

      <GlassCard hover={false}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{t.journal.durationLabel}</p>
            <p className="text-lg font-bold text-foreground">{t.journal.durationDays(days)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.journal.tasksLabel}</p>
            <p className="text-lg font-bold text-foreground">{mission.tasksCompleted} / {mission.target}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.journal.startedLabel}</p>
            <p className="text-sm font-medium text-foreground">
              {format(parseISO(mission.startedAt), 'd MMM yyyy', { locale: t.dateLocale })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.journal.completedLabel}</p>
            <p className="text-sm font-medium text-foreground">
              {format(parseISO(mission.completedAt), 'd MMM yyyy', { locale: t.dateLocale })}
            </p>
          </div>
          {mission.deadline && (
            <div>
              <p className="text-xs text-muted-foreground">{t.journal.deadlineLabel}</p>
              <p className="text-sm font-medium text-foreground">
                {format(parseISO(mission.deadline), 'd MMM yyyy', { locale: t.dateLocale })}
              </p>
            </div>
          )}
          {mission.moneyGoal && (
            <div>
              <p className="text-xs text-muted-foreground">{t.journal.moneyGoalLabel}</p>
              <p className="text-sm font-medium text-foreground">{mission.moneyGoal.toLocaleString()}</p>
            </div>
          )}
        </div>
      </GlassCard>

      <ThoughtsSection thoughts={thoughts} />
    </div>
  )
}

// ── Thoughts section ──────────────────────────────────────────────────────────

function ThoughtsSection({ thoughts, onDelete }: { thoughts: Thought[]; onDelete?: (id: string) => void }) {
  const t = useTranslations()
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-3">{t.journal.thoughtsHeading(thoughts.length)}</h2>
      {thoughts.length === 0 ? (
        <GlassCard className="flex items-center justify-center py-8" hover={false}>
          <p className="text-sm text-muted-foreground">{t.journal.noThoughts}</p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {thoughts.map(thought => (
            <GlassCard key={thought.id} className="py-3 px-4" hover={false}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-foreground">{thought.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(parseISO(thought.createdAt), 'd MMM yyyy, HH:mm', { locale: t.dateLocale })}
                  </p>
                </div>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(thought.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-lg shrink-0"
                    aria-label={t.journal.deleteThought}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
