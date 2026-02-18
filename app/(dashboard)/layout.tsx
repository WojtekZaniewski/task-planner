import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Fetch user's workspaces
  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(id, name, description, owner_id, created_at)')
    .eq('user_id', user.id)

  const workspaces = (memberships ?? [])
    .map((m: any) => m.workspaces)
    .filter(Boolean)

  const userName = profile?.full_name ?? user.email ?? 'Użytkownik'

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar workspaces={workspaces} userName={userName} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile nav */}
        <MobileNav workspaces={workspaces} userName={userName} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
