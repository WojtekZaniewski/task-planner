'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckSquare, LogOut, LayoutDashboard, ListTodo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  userName: string
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="glass-strong flex h-16 shrink-0 items-center justify-between px-4 sm:px-6 border-b border-white/20 z-10">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <CheckSquare className="h-5 w-5 text-primary" />
          <span className="text-primary">tasks</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
              pathname === '/dashboard'
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link
            href="/tasks"
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
              pathname === '/tasks'
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ListTodo className="h-4 w-4" />
            <span className="hidden sm:inline">Zadania</span>
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:block">{userName}</span>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
