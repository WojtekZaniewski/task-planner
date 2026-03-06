'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, CheckCircle2, Clock, MessageSquare, Trophy } from 'lucide-react'
import { GlassCard } from '@/components/dashboard/glass-card'
import { BentoGrid } from '@/components/dashboard/bento-grid'
import { useJournal } from '@/lib/hooks/use-journal'
import { format, differenceInDays, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'
import type { CompletedMission, Thought } from '@/lib/types'

export default function JournalPage() {
  const router = useRouter()
  const { completedMissions, getWeeklySummary, getThoughtsForMission, loading } = useJournal()
  const [selectedMission, setSelectedMission] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="bento-grid">
        <div className="glass rounded-bento bento-1x1 animate-pulse" />
        <div className="glass rounded-bento bento-1x1 animate-pulse" />
      </div>
    )
  }

  const weekly = getWeeklySummary()
  const mission = selectedMission ? completedMissions.find(m => m.id === selectedMission) : null

  if (mission) {
    return <MissionDetail mission={mission} thoughts={getThoughtsForMission(mission.id)} onBack={() => setSelectedMission(null)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Wróć do dashboardu"
          onClick={() => router.push('/dashboard')}
          className="glass-button flex h-9 w-9 items-center justify-center rounded-full"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Dziennik</h1>
      </div>

      {/* Weekly summary */}
      <GlassCard className="flex items-center gap-4" hover={false}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Trophy className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Podsumowanie tygodniowe</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {weekly.missionsCount === 0
              ? 'Brak ukończonych misji w tym tygodniu'
              : `${weekly.missionsCount} ${weekly.missionsCount === 1 ? 'misja' : weekly.missionsCount < 5 ? 'misje' : 'misji'} \u00b7 ${weekly.totalTasks} ${weekly.totalTasks === 1 ? 'zadanie' : 'zadań'}`}
          </p>
        </div>
      </GlassCard>

      {/* Mission list */}
      {completedMissions.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-12 gap-3" hover={false}>
          <Calendar className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground text-center">
            Tutaj pojawią się ukończone misje
          </p>
        </GlassCard>
      ) : (
        <BentoGrid>
          {completedMissions.map(m => {
            const days = differenceInDays(parseISO(m.completedAt), parseISO(m.startedAt))
            const thoughtCount = m.thoughts.length

            return (
              <GlassCard
                key={m.id}
                className="bento-1x1 flex flex-col justify-between cursor-pointer"
                hover
              >
                <div onClick={() => setSelectedMission(m.id)} className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(parseISO(m.completedAt), 'd MMMM yyyy', { locale: pl })}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground glass-subtle rounded-full px-2.5 py-1">
                      <Clock className="h-3 w-3" />
                      {days} {days === 1 ? 'dzień' : 'dni'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground glass-subtle rounded-full px-2.5 py-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {m.tasksCompleted} {m.tasksCompleted === 1 ? 'zadanie' : 'zadań'}
                    </span>
                    {thoughtCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-primary glass-subtle rounded-full px-2.5 py-1">
                        <MessageSquare className="h-3 w-3" />
                        {thoughtCount}
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

function MissionDetail({
  mission,
  thoughts,
  onBack,
}: {
  mission: CompletedMission
  thoughts: Thought[]
  onBack: () => void
}) {
  const days = differenceInDays(parseISO(mission.completedAt), parseISO(mission.startedAt))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Wróć do dziennika"
          onClick={onBack}
          className="glass-button flex h-9 w-9 items-center justify-center rounded-full"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">{mission.name}</h1>
      </div>

      {/* Mission stats */}
      <GlassCard hover={false}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Czas trwania</p>
            <p className="text-lg font-bold text-foreground">{days} {days === 1 ? 'dzień' : 'dni'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Zadania</p>
            <p className="text-lg font-bold text-foreground">{mission.tasksCompleted} / {mission.target}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rozpoczęto</p>
            <p className="text-sm font-medium text-foreground">
              {format(parseISO(mission.startedAt), 'd MMM yyyy', { locale: pl })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ukończono</p>
            <p className="text-sm font-medium text-foreground">
              {format(parseISO(mission.completedAt), 'd MMM yyyy', { locale: pl })}
            </p>
          </div>
          {mission.deadline && (
            <div>
              <p className="text-xs text-muted-foreground">Deadline</p>
              <p className="text-sm font-medium text-foreground">
                {format(parseISO(mission.deadline), 'd MMM yyyy', { locale: pl })}
              </p>
            </div>
          )}
          {mission.moneyGoal && (
            <div>
              <p className="text-xs text-muted-foreground">Cel pieniędzy</p>
              <p className="text-sm font-medium text-foreground">
                {mission.moneyGoal.toLocaleString('pl-PL')} zł
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Thoughts */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Przemyślenia ({thoughts.length})
        </h2>
        {thoughts.length === 0 ? (
          <GlassCard className="flex items-center justify-center py-8" hover={false}>
            <p className="text-sm text-muted-foreground">Brak przemyśleń dla tej misji</p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {thoughts.map(t => (
              <GlassCard key={t.id} className="py-3 px-4" hover={false}>
                <p className="text-sm text-foreground">{t.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(parseISO(t.createdAt), 'd MMM yyyy, HH:mm', { locale: pl })}
                </p>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
