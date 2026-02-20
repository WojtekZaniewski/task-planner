'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useTheme } from '@/components/theme-provider'
import { toast } from 'sonner'
import {
  ArrowRight,
  ArrowLeft,
  User,
  Calendar,
  Target,
  Briefcase,
  Layout,
  Palette,
  Sun,
  Moon,
  Monitor,
  CheckSquare,
  CalendarDays,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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

interface OnboardingWizardProps {
  userId: string
  initialName: string
}

export function OnboardingWizard({ userId, initialName }: OnboardingWizardProps) {
  const router = useRouter()
  const supabase = createClient()
  const { setTheme } = useTheme()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState(initialName)
  const [age, setAge] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [role, setRole] = useState('')
  const [appMode, setAppMode] = useState<AppMode>('calendar')
  const [theme, setThemeChoice] = useState<ThemePreference>('system')

  const totalSteps = 6

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

  async function handleFinish() {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: name || 'User',
        age: age ? parseInt(age) : null,
        goals: goals.length > 0 ? goals : null,
        role: role || null,
        app_mode: appMode,
        theme,
        onboarding_completed: true,
      })
      .eq('id', userId)

    if (error) {
      toast.error('Nie udało się zapisać profilu', { description: error.message })
      setSaving(false)
      return
    }

    localStorage.setItem('theme', theme)
    router.push('/private')
    router.refresh()
  }

  function canProceed() {
    switch (step) {
      case 0: return name.trim().length > 0
      case 1: return true // age is optional
      case 2: return true // goals are optional
      case 3: return true // role is optional
      case 4: return true // app_mode has default
      case 5: return true // theme has default
      default: return true
    }
  }

  return (
    <Card className="w-full max-w-lg">
      {/* Progress bar */}
      <div className="px-6 pt-6">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                i <= step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-right">
          {step + 1} / {totalSteps}
        </p>
      </div>

      {/* Step 1: Name */}
      {step === 0 && (
        <>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Jak masz na imię?</CardTitle>
            <CardDescription>Będziemy się tak do Ciebie zwracać</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Twoje imię"
              className="text-center text-lg"
              autoFocus
            />
          </CardContent>
        </>
      )}

      {/* Step 2: Age */}
      {step === 1 && (
        <>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Ile masz lat?</CardTitle>
            <CardDescription>Opcjonalne - pomoże nam dostosować treści</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Twój wiek"
              className="text-center text-lg"
              min={10}
              max={120}
              autoFocus
            />
          </CardContent>
        </>
      )}

      {/* Step 3: Goals */}
      {step === 2 && (
        <>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Co chciałbyś poprawić?</CardTitle>
            <CardDescription>Wybierz dowolną liczbę celów</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                    goals.includes(goal.id)
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <span className="text-lg">{goal.icon}</span>
                  <span className="font-medium">{goal.label}</span>
                  {goals.includes(goal.id) && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </>
      )}

      {/* Step 4: Role */}
      {step === 3 && (
        <>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Jak najlepiej opisujesz swoją rolę?</CardTitle>
            <CardDescription>To pomoże nam dostosować interfejs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={cn(
                    'rounded-lg border p-3 text-left font-medium transition-colors',
                    role === r.id
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  {r.label}
                  {role === r.id && (
                    <span className="float-right text-primary">✓</span>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </>
      )}

      {/* Step 5: App Mode */}
      {step === 4 && (
        <>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Layout className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Jaki tryb aplikacji preferujesz?</CardTitle>
            <CardDescription>Możesz zmienić to później w ustawieniach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setAppMode('tasks')}
                className={cn(
                  'rounded-xl border-2 p-4 text-left transition-colors',
                  appMode === 'tasks'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Lista zadań</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Prosty tryb z kalendarzem dziennym i tygodniowym. Zadania jako rutyny do odhaczenia - bez wymagania godziny.
                </p>
              </button>
              <button
                onClick={() => setAppMode('calendar')}
                className={cn(
                  'rounded-xl border-2 p-4 text-left transition-colors',
                  appMode === 'calendar'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Kalendarz</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pełny planner z widokami: Lista, Kanban, Dzień, Tydzień, Miesiąc. Więcej opcji organizacji zadań.
                </p>
              </button>
            </div>
          </CardContent>
        </>
      )}

      {/* Step 6: Theme */}
      {step === 5 && (
        <>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Jaki wygląd preferujesz?</CardTitle>
            <CardDescription>Motyw zmieni się od razu</CardDescription>
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
                  onClick={() => handleThemePreview(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors',
                    theme === value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 pb-6">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Wstecz
        </Button>

        {step < totalSteps - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
          >
            Dalej
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            Rozpocznij
          </Button>
        )}
      </div>
    </Card>
  )
}
