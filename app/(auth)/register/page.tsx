'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      toast.error('Nie udało się utworzyć konta', {
        description: error.message,
      })
      setLoading(false)
      return
    }

    toast.success('Konto utworzone!', {
      description: 'Sprawdź email, aby potwierdzić rejestrację.',
    })
    router.push('/login')
  }

  return (
    <div className="glass rounded-bento p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <CheckSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">tasks</h1>
        </div>
        <p className="text-sm text-muted-foreground">Utwórz nowe konto</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Imię i nazwisko</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Jan Kowalski"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="jan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 6 znaków"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          Zarejestruj się
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Masz już konto?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Zaloguj się
        </Link>
      </p>
    </div>
  )
}
