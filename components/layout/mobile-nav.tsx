'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CheckSquare, Users, Settings, LogOut, Menu, X, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { Workspace } from '@/lib/types'

interface MobileNavProps {
  workspaces: Workspace[]
  userName: string
}

export function MobileNav({ workspaces, userName }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Top bar */}
      <div className="flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
        <Link href="/private" className="flex items-center gap-2 font-semibold">
          <CheckSquare className="h-5 w-5 text-primary" />
          <span>TaskFlow</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-background shadow-lg">
            <div className="flex h-14 items-center border-b px-4">
              <span className="font-semibold">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="space-y-1 p-3">
              <Link
                href="/private"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  pathname === '/private'
                    ? 'bg-accent font-medium'
                    : 'hover:bg-accent/50'
                )}
              >
                <CheckSquare className="h-4 w-4" />
                Prywatne
              </Link>

              <div className="pt-3">
                <p className="px-3 text-xs font-medium text-muted-foreground uppercase">
                  Coworking
                </p>
                <div className="mt-1 space-y-1">
                  {workspaces.map((ws) => (
                    <Link
                      key={ws.id}
                      href={`/coworking/${ws.id}`}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                        pathname.startsWith(`/coworking/${ws.id}`)
                          ? 'bg-accent font-medium'
                          : 'text-muted-foreground hover:bg-accent/50'
                      )}
                    >
                      {ws.name}
                    </Link>
                  ))}
                  <Link
                    href="/coworking"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent/50"
                  >
                    <Plus className="h-3 w-3" />
                    Nowy workspace
                  </Link>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    pathname === '/settings'
                      ? 'bg-accent font-medium'
                      : 'hover:bg-accent/50'
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Ustawienia
                </Link>
              </div>
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t p-3">
              <div className="flex items-center justify-between">
                <span className="truncate text-sm font-medium">{userName}</span>
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
          </div>
        </div>
      )}
    </>
  )
}
