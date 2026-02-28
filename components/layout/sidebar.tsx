'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  CheckSquare,
  Settings,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { Workspace } from '@/lib/types'

interface SidebarProps {
  workspaces: Workspace[]
  userName: string
  avatarUrl?: string | null
}

export function Sidebar({ workspaces, userName, avatarUrl }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Hide sidebar on hub page
  if (pathname === '/private') return null

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar dark:glass-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link href="/private" className="flex items-center gap-2 font-bold">
          <CheckSquare className="h-5 w-5 text-primary" />
          <span className="font-display bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
            tasks
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <Link
          href="/private/tasks"
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
            pathname.startsWith('/private')
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
          )}
        >
          <CheckSquare className="h-4 w-4" />
          zadania
        </Link>

        <div className="pt-4">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
              pathname === '/settings'
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <Settings className="h-4 w-4" />
            konto
          </Link>
        </div>
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-medium text-sidebar-foreground">
            {userName}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
