'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/dashboard/glass-card'
import { Input } from '@/components/ui/input'
import { format, differenceInDays, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'
import { CalendarDays, Pencil, Save, Clock, Wallet, Trophy } from 'lucide-react'

interface HeroTileProps {
  total: number
  done: number
  onMissionChange?: (active: boolean) => void
  onMissionComplete?: (name: string, target: number, tasksCompleted: number, startedAt: string, deadline?: string, moneyGoal?: number) => void
}

export const MISSION_STORAGE_KEY = 'task-planner-mission'

export interface MissionGoal {
  name: string
  target: number
  startedAt?: string
  deadline?: string
  moneyGoal?: number
  moneyBalance?: number
}

export function HeroTile({ total, done, onMissionChange, onMissionComplete }: HeroTileProps) {
  const today = format(new Date(), "EEEE, d MMMM", { locale: pl })
  const [editing, setEditing] = useState(false)
  const [goal, setGoal] = useState<MissionGoal>({ name: '', target: 0 })
  const [draft, setDraft] = useState<MissionGoal>({ name: '', target: 0 })

  useEffect(() => {
    const stored = localStorage.getItem(MISSION_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MissionGoal
        setGoal(parsed)
        setDraft(parsed)
        onMissionChange?.(!!parsed.name && parsed.target > 0)
      } catch { /* ignore */ }
    }
  }, [onMissionChange])

  const hasGoal = !!(goal.name && goal.target > 0)
  const target = hasGoal ? goal.target : total
  const percentage = target === 0 ? 0 : Math.min(100, Math.round((done / target) * 100))
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (percentage / 100) * circumference

  const daysLeft = goal.deadline
    ? differenceInDays(parseISO(goal.deadline), new Date())
    : null

  const moneyMissing = goal.moneyGoal && goal.moneyGoal > 0
    ? goal.moneyGoal - (goal.moneyBalance || 0)
    : null

  function handleSave() {
    if (!draft.name.trim() || draft.target < 1) return
    const saved: MissionGoal = {
      name: draft.name.trim(),
      target: draft.target,
      startedAt: goal.startedAt || new Date().toISOString(),
      deadline: draft.deadline || undefined,
      moneyGoal: draft.moneyGoal || undefined,
      moneyBalance: draft.moneyBalance || undefined,
    }
    setGoal(saved)
    localStorage.setItem(MISSION_STORAGE_KEY, JSON.stringify(saved))
    onMissionChange?.(true)
    setEditing(false)
  }

  function handleComplete() {
    if (!hasGoal) return
    onMissionComplete?.(
      goal.name,
      goal.target,
      done,
      goal.startedAt || new Date().toISOString(),
      goal.deadline,
      goal.moneyGoal,
    )
    // Clear mission
    setGoal({ name: '', target: 0 })
    setDraft({ name: '', target: 0 })
    localStorage.removeItem(MISSION_STORAGE_KEY)
    onMissionChange?.(false)
  }

  function openEdit() {
    setDraft(goal.name ? { ...goal } : { name: '', target: 10 })
    setEditing(true)
  }

  return (
    <GlassCard className="bento-1x1 flex flex-col justify-between" hover={false}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            Twoja<br />
            <span className="text-primary">misja</span>
          </h1>
          {hasGoal && !editing && (
            <p className="text-sm text-muted-foreground mt-2">{goal.name}</p>
          )}
        </div>
        {!editing && (
          <button
            type="button"
            aria-label="Edytuj cel"
            onClick={openEdit}
            className="glass-button flex h-8 w-8 items-center justify-center rounded-full shrink-0"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex-1 flex flex-col justify-center gap-3 py-4 overflow-y-auto">
          <div>
            <label htmlFor="goal-name" className="text-xs text-muted-foreground mb-1.5 block">
              Główny cel:
            </label>
            <Input
              id="goal-name"
              placeholder="Np. Zdać egzamin"
              value={draft.name}
              onChange={(e) => setDraft(d => ({ ...d, name: e.target.value }))}
              className="glass-button text-sm border-0 rounded-2xl px-4 py-3 h-auto focus-visible:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="goal-target" className="text-xs text-muted-foreground mb-1.5 block">
              Ilość zadań aby osiągnąć 100%:
            </label>
            <Input
              id="goal-target"
              type="number"
              min={1}
              placeholder="10"
              value={draft.target || ''}
              onChange={(e) => setDraft(d => ({ ...d, target: parseInt(e.target.value) || 0 }))}
              className="glass-button text-sm border-0 rounded-2xl px-4 py-3 h-auto focus-visible:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="goal-deadline" className="text-xs text-muted-foreground mb-1.5 block">
              Deadline (opcjonalnie):
            </label>
            <Input
              id="goal-deadline"
              type="date"
              value={draft.deadline || ''}
              onChange={(e) => setDraft(d => ({ ...d, deadline: e.target.value || undefined }))}
              className="glass-button text-sm border-0 rounded-2xl px-4 py-3 h-auto focus-visible:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="goal-money" className="text-xs text-muted-foreground mb-1.5 block">
              Cel pieniędzy (opcjonalnie):
            </label>
            <Input
              id="goal-money"
              type="number"
              min={0}
              placeholder="Np. 5000"
              value={draft.moneyGoal || ''}
              onChange={(e) => setDraft(d => ({ ...d, moneyGoal: parseInt(e.target.value) || 0 }))}
              className="glass-button text-sm border-0 rounded-2xl px-4 py-3 h-auto focus-visible:ring-primary/30"
            />
          </div>
          {(draft.moneyGoal ?? 0) > 0 && (
            <div>
              <label htmlFor="goal-balance" className="text-xs text-muted-foreground mb-1.5 block">
                Obecny stan konta:
              </label>
              <Input
                id="goal-balance"
                type="number"
                min={0}
                placeholder="Np. 2000"
                value={draft.moneyBalance || ''}
                onChange={(e) => setDraft(d => ({ ...d, moneyBalance: parseInt(e.target.value) || 0 }))}
                className="glass-button text-sm border-0 rounded-2xl px-4 py-3 h-auto focus-visible:ring-primary/30"
              />
            </div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!draft.name.trim() || draft.target < 1}
            className="glass-button-primary w-full rounded-2xl px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            Zapisz cel
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 py-4 cursor-pointer" onClick={openEdit}>
          <div className="relative h-36 w-36 sm:h-44 sm:w-44">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold text-foreground">{percentage}%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{done} z {target} ukończonych</p>

          {(daysLeft !== null || moneyMissing !== null) && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
              {daysLeft !== null && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground glass-subtle rounded-full px-3 py-1">
                  <Clock className="h-3 w-3" />
                  {daysLeft > 0 ? `Pozostało ${daysLeft} dni` : daysLeft === 0 ? 'Dziś deadline!' : `${Math.abs(daysLeft)} dni po terminie`}
                </span>
              )}
              {moneyMissing !== null && moneyMissing > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground glass-subtle rounded-full px-3 py-1">
                  <Wallet className="h-3 w-3" />
                  Brakuje {moneyMissing.toLocaleString('pl-PL')} zł
                </span>
              )}
              {moneyMissing !== null && moneyMissing <= 0 && (
                <span className="flex items-center gap-1.5 text-xs text-primary glass-subtle rounded-full px-3 py-1">
                  <Wallet className="h-3 w-3" />
                  Cel osiągnięty!
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {hasGoal && !editing && done >= target && (
        <button
          type="button"
          onClick={handleComplete}
          className="glass-button-primary w-full rounded-2xl px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 mb-2"
        >
          <Trophy className="h-4 w-4" />
          Zakończ misję
        </button>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="h-4 w-4" />
        <span>{today}</span>
      </div>
    </GlassCard>
  )
}
