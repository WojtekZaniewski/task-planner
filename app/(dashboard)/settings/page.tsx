'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/components/theme-provider'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Loader2,
  Sun,
  Moon,
  Monitor,
  CheckSquare,
  CalendarDays,
  Save,
} from 'lucide-react'
import type { AppMode, ThemePreference } from '@/lib/types'

const GOALS = [
  { id: 'productivity', label: 'Produktywność', icon: '⚡' },
  { id: 'time', label: 'Organizacja czasu', icon: '⏰' },
  { id: 'teamwork', label: 'Praca zespołowa', icon: '🤝' },
  { id: 'habits', label: 'Nawyki', icon: '🔄' },
  { id: 'personal', label: 'Cele osobiste', icon: '🎯' },
]

const ROLES = [
  { id: 'student', label: 'Student' },
  { id: 'freelancer', label: 'Freelancer' },
  { id: 'employee', label: 'Pracownik' },
  { id: 'manager', label: 'Manager' },
  { id: 'entrepreneur', label: 'Przedsiębiorca' },
]

export default function SettingsPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [role, setRole] = useState('')
  const [appMode, setAppMode] = useState<AppMode>('calendar')
  const [themeChoice, setThemeChoice] = useState<ThemePreference>('system')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const { setTheme } = useTheme()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email || '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, age, goals, role, app_mode, theme')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || '')
        setAge(profile.age?.toString() || '')
        setGoals(profile.goals || [])
        setRole(profile.role || '')
        setAppMode(profile.app_mode || 'calendar')
        setThemeChoice(profile.theme || 'system')
      }
      setLoading(false)
    }

    fetchProfile()
  }, [supabase])

  function toggleGoal(goalId: string) {
    setGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    )
  }

  function handleThemePreview(t: ThemePreference) {
    setThemeChoice(t)
    setTheme(t)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || 'User',
        age: age ? parseInt(age) : null,
        goals: goals.length > 0 ? goals : null,
        role: role || null,
        app_mode: appMode,
        theme: themeChoice,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Nie udało się zapisać', { description: error.message })
    } else {
      localStorage.setItem('theme', themeChoice)
      toast.success('Ustawienia zapisane')
      router.refresh()
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Ustawienia</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profil */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profil</CardTitle>
            <CardDescription>Twoje dane podstawowe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Imię</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Wiek</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={10}
                max={120}
                placeholder="Opcjonalne"
              />
            </div>
            <div className="space-y-2">
              <Label>Rola</Label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={cn(
                      'rounded-lg border p-2 text-sm font-medium transition-colors',
                      role === r.id
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border hover:bg-muted'
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cele */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cele</CardTitle>
            <CardDescription>Co chcesz poprawić?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                    goals.includes(goal.id)
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <span className="text-lg">{goal.icon}</span>
                  <span className="font-medium text-sm">{goal.label}</span>
                  {goals.includes(goal.id) && (
                    <span className="ml-auto text-primary text-sm">✓</span>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wygląd */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Wygląd</CardTitle>
            <CardDescription>Motyw kolorystyczny</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'light' as ThemePreference, label: 'Jasny', icon: Sun },
                { value: 'dark' as ThemePreference, label: 'Ciemny', icon: Moon },
                { value: 'system' as ThemePreference, label: 'System', icon: Monitor },
              ]).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleThemePreview(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors',
                    themeChoice === value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tryb aplikacji */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tryb aplikacji</CardTitle>
            <CardDescription>Jak chcesz korzystać z TaskFlow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setAppMode('tasks')}
                className={cn(
                  'rounded-xl border-2 p-4 text-left transition-colors',
                  appMode === 'tasks'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted'
                )}
              >
                <div className="flex items-center gap-3 mb-1">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Lista zadań</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Kalendarz dzienny i tygodniowy. Zadania jako rutyny do odhaczenia.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setAppMode('calendar')}
                className={cn(
                  'rounded-xl border-2 p-4 text-left transition-colors',
                  appMode === 'calendar'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted'
                )}
              >
                <div className="flex items-center gap-3 mb-1">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Kalendarz</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Lista, Kanban, Dzień, Tydzień, Miesiąc. Pełne opcje planowania.
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          Zapisz ustawienia
        </Button>
      </form>
    </div>
  )
}
