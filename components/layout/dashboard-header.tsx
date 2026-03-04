'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckSquare, LayoutDashboard, ListTodo } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DashboardHeader() {
  const pathname = usePathname()

  return (
    <header className="glass-strong flex h-16 shrink-0 items-center px-4 sm:px-6 border-b border-white/20 z-10">
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
    </header>
  )
}
