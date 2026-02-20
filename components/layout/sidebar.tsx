'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  CheckSquare,
  Users,
  Settings,
  LogOut,
  Plus,
  ChevronDown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { Workspace } from '@/lib/types'
import { useState } from 'react'

interface SidebarProps {
  workspaces: Workspace[]
  userName: string
}

export function Sidebar({ workspaces, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [workspacesOpen, setWorkspacesOpen] = useState(true)

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
          <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
            TaskFlow
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {/* Private section */}
        <Link
          href="/private"
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
            pathname === '/private'
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
          )}
        >
          <CheckSquare className="h-4 w-4" />
          Prywatne
        </Link>

        {/* Coworking section */}
        <div className="pt-4">
          <button
            onClick={() => setWorkspacesOpen(!workspacesOpen)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span className="flex-1 text-left">Coworking</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                workspacesOpen && 'rotate-180'
              )}
            />
          </button>

          {workspacesOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {workspaces.map((ws) => (
                <Link
                  key={ws.id}
                  href={`/coworking/${ws.id}`}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm transition-colors',
                    pathname.startsWith(`/coworking/${ws.id}`)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <span className="truncate">{ws.name}</span>
                </Link>
              ))}
              <Link
                href="/coworking"
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>Nowy workspace</span>
              </Link>
            </div>
          )}
        </div>

        {/* Settings */}
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
            Ustawienia
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
