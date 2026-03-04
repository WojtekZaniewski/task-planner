import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/layout/dashboard-header'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name ?? user.email ?? ''

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <DashboardHeader userName={userName} />
      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>
    </div>
  )
}
