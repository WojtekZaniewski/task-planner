'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, CheckCircle2, Clock, MessageSquare, Trophy, Mic, Trash2 } from 'lucide-react'
import { GlassCard } from '@/components/dashboard/glass-card'
import { BentoGrid } from '@/components/dashboard/bento-grid'
import { useJournal } from '@/lib/hooks/use-journal'
import { useVoiceNotes } from '@/lib/hooks/use-voice-notes'
import { VoiceRecorder } from '@/components/journal/VoiceRecorder'
import { VoiceNotePlayer } from '@/components/journal/VoiceNotePlayer'
import { Progress } from '@/components/ui/progress'
import { format, differenceInDays, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import type { CompletedMission, MissionGoal, Thought, VoiceNote } from '@/lib/types'

type SelectedMission = { id: string; isActive: boolean } | null

export default function JournalPage() {
  const router = useRouter()
  const { completedMissions, activeMission, activeMissionId, getWeeklySummary, getThoughtsForMission, deleteThought, loading } = useJournal()
  const [selectedMission, setSelectedMission] = useState<SelectedMission>(null)
  const [doneTasksCount, setDoneTasksCount] = useState(0)

  useEffect(() => {
    if (!activeMissionId) return
    const supabase = createClient()
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .is('workspace_id', null)
      .eq('status', 'done')
      .then(({ count }) => setDoneTasksCount(count ?? 0))
  }, [activeMissionId])

  if (loading) {
    return (
      <div className="bento-grid">
        <div className="glass rounded-bento bento-1x1 animate-pulse" />
        <div className="glass rounded-bento bento-1x1 animate-pulse" />
      </div>
    )
  }

  const weekly = getWeeklySummary()

  if (selectedMission) {
    if (selectedMission.isActive && activeMission && activeMissionId) {
      return (
        <ActiveMissionDetail
          missionId={activeMissionId}
          activeMission={activeMission}
          doneCount={doneTasksCount}
          thoughts={getThoughtsForMission(activeMissionId)}
          onBack={() => setSelectedMission(null)}
          onDeleteThought={deleteThought}
        />
      )
    }
    const mission = completedMissions.find(m => m.id === selectedMission.id)
    if (mission) {
      return (
        <MissionDetail
          mission={mission}
          thoughts={getThoughtsForMission(mission.id)}
          onBack={() => setSelectedMission(null)}
        />
      )
    }
  }

  const activePercentage = activeMission
    ? Math.min(100, Math.round((doneTasksCount / activeMission.target) * 100))
    : 0
  const activeDaysLeft = activeMission?.deadline
    ? differenceInDays(parseISO(activeMission.deadline), new Date())
    : null

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

      {/* Active mission */}
      {activeMission && activeMissionId && (
        <div
          className="glass rounded-bento p-5 glass-hover glow-orange cursor-pointer"
          onClick={() => setSelectedMission({ id: activeMissionId, isActive: true })}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">{activeMission.name}</p>
            <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5 shrink-0">
              W trakcie
            </span>
          </div>
          <Progress value={activePercentage} className="h-1.5 mb-2" />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{doneTasksCount} z {activeMission.target} zadań</p>
            {activeDaysLeft !== null && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground glass-subtle rounded-full px-2.5 py-1">
                <Clock className="h-3 w-3" />
                {activeDaysLeft > 0
                  ? `${activeDaysLeft} dni`
                  : activeDaysLeft === 0
                  ? 'Dziś!'
                  : 'Po terminie'}
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
          <p className="text-sm font-semibold text-foreground">Podsumowanie tygodniowe</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {weekly.missionsCount === 0
              ? 'Brak ukończonych misji w tym tygodniu'
              : `${weekly.missionsCount} ${weekly.missionsCount === 1 ? 'misja' : weekly.missionsCount < 5 ? 'misje' : 'misji'} · ${weekly.totalTasks} ${weekly.totalTasks === 1 ? 'zadanie' : 'zadań'}`}
          </p>
        </div>
      </GlassCard>

      {/* Completed missions */}
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
                <div onClick={() => setSelectedMission({ id: m.id, isActive: false })} className="flex flex-col justify-between h-full">
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

// ── Active Mission Detail ───────────────────────────────────────────────────

function ActiveMissionDetail({
  missionId,
  activeMission,
  doneCount,
  thoughts,
  onBack,
  onDeleteThought,
}: {
  missionId: string
  activeMission: MissionGoal
  doneCount: number
  thoughts: Thought[]
  onBack: () => void
  onDeleteThought?: (thoughtId: string) => void
}) {
  const { notes, loading: notesLoading, recording, uploading, startRecording, stopRecording, deleteNote, refreshSignedUrl } = useVoiceNotes(missionId)
  const days = differenceInDays(new Date(), parseISO(activeMission.startedAt ?? new Date().toISOString()))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Wróć do dziennika" onClick={onBack} className="glass-button flex h-9 w-9 items-center justify-center rounded-full">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">{activeMission.name}</h1>
          <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5">W trakcie</span>
        </div>
      </div>

      <GlassCard hover={false}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Czas trwania (w toku)</p>
            <p className="text-lg font-bold text-foreground">{days} {days === 1 ? 'dzień' : 'dni'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Zadania</p>
            <p className="text-lg font-bold text-foreground">{doneCount} / {activeMission.target}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rozpoczęto</p>
            <p className="text-sm font-medium text-foreground">
              {format(parseISO(activeMission.startedAt ?? new Date().toISOString()), 'd MMM yyyy', { locale: pl })}
            </p>
          </div>
          {activeMission.deadline && (
            <div>
              <p className="text-xs text-muted-foreground">Deadline</p>
              <p className="text-sm font-medium text-foreground">
                {format(parseISO(activeMission.deadline), 'd MMM yyyy', { locale: pl })}
              </p>
            </div>
          )}
          {activeMission.moneyGoal && (
            <div>
              <p className="text-xs text-muted-foreground">Cel pieniędzy</p>
              <p className="text-sm font-medium text-foreground">
                {activeMission.moneyGoal.toLocaleString('pl-PL')} zł
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Thoughts */}
      <ThoughtsSection thoughts={thoughts} onDelete={onDeleteThought} />

      {/* Voice Notes */}
      <VoiceNotesSection
        notes={notes}
        loading={notesLoading}
        recording={recording}
        uploading={uploading}
        onStart={startRecording}
        onStop={stopRecording}
        onDelete={(note) => deleteNote(note.id, note.storagePath)}
        onSignedUrlExpired={(note) => refreshSignedUrl(note.storagePath)}
        canRecord
      />
    </div>
  )
}

// ── Completed Mission Detail ────────────────────────────────────────────────

function MissionDetail({ mission, thoughts, onBack }: { mission: CompletedMission; thoughts: Thought[]; onBack: () => void }) {
  const { notes, loading: notesLoading, deleteNote, refreshSignedUrl } = useVoiceNotes(mission.id)
  const days = differenceInDays(parseISO(mission.completedAt), parseISO(mission.startedAt))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Wróć do dziennika" onClick={onBack} className="glass-button flex h-9 w-9 items-center justify-center rounded-full">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">{mission.name}</h1>
      </div>

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

      <ThoughtsSection thoughts={thoughts} />

      <VoiceNotesSection
        notes={notes}
        loading={notesLoading}
        onDelete={(note) => deleteNote(note.id, note.storagePath)}
        onSignedUrlExpired={(note) => refreshSignedUrl(note.storagePath)}
      />
    </div>
  )
}

// ── Shared sub-sections ─────────────────────────────────────────────────────

function ThoughtsSection({ thoughts, onDelete }: { thoughts: Thought[]; onDelete?: (thoughtId: string) => void }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-3">Przemyślenia ({thoughts.length})</h2>
      {thoughts.length === 0 ? (
        <GlassCard className="flex items-center justify-center py-8" hover={false}>
          <p className="text-sm text-muted-foreground">Brak przemyśleń</p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {thoughts.map(t => (
            <GlassCard key={t.id} className="py-3 px-4" hover={false}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-foreground">{t.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(parseISO(t.createdAt), 'd MMM yyyy, HH:mm', { locale: pl })}
                  </p>
                </div>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(t.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-lg shrink-0"
                    aria-label="Usuń przemyślenie"
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

function VoiceNotesSection({
  notes,
  loading,
  recording,
  uploading,
  onStart,
  onStop,
  onDelete,
  onSignedUrlExpired,
  canRecord = false,
}: {
  notes: VoiceNote[]
  loading: boolean
  recording?: boolean
  uploading?: boolean
  onStart?: () => void
  onStop?: () => void
  onDelete: (note: VoiceNote) => void
  onSignedUrlExpired: (note: VoiceNote) => Promise<string>
  canRecord?: boolean
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">
          Notatki głosowe ({notes.length})
        </h2>
        {canRecord && onStart && onStop && (
          <VoiceRecorder
            recording={recording ?? false}
            uploading={uploading ?? false}
            onStart={onStart}
            onStop={onStop}
          />
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="glass rounded-2xl h-16 animate-pulse" />
        </div>
      ) : notes.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-8 gap-2" hover={false}>
          <Mic className="h-6 w-6 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Brak notatek głosowych</p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {notes.map(note => (
            <VoiceNotePlayer
              key={note.id}
              note={note}
              onDelete={() => onDelete(note)}
              onSignedUrlExpired={() => onSignedUrlExpired(note)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
