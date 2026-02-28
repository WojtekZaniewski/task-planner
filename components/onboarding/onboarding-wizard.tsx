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
  Palette,
  Sun,
  Moon,
  Monitor,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ThemePreference } from '@/lib/types'

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
  const [theme, setThemeChoice] = useState<ThemePreference>('system')

  const totalSteps = 5

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
      .upsert({
        id: userId,
        full_name: name || 'User',
        age: age ? parseInt(age) : null,
        goals: goals.length > 0 ? goals : null,
        role: role || null,
        app_mode: 'tasks',
        theme,
        onboarding_completed: true,
      })

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
      case 4: return true // theme has default
      default: return true
    }
  }

  return (
    <Card className="w-full max-w-lg dark:glass-card dark:border-border/50">
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
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-display">Jak masz na imię?</CardTitle>
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
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-display">Ile masz lat?</CardTitle>
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
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-display">Co chciałbyś poprawić?</CardTitle>
            <CardDescription>Wybierz dowolną liczbę celów</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors',
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
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-display">Jak najlepiej opisujesz swoją rolę?</CardTitle>
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

      {/* Step 5: Theme */}
      {step === 4 && (
        <>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-display">Jaki wygląd preferujesz?</CardTitle>
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
