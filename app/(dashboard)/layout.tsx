import { DashboardHeader } from '@/components/layout/dashboard-header'

export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto p-3 sm:p-4">
        {children}
      </main>
    </div>
  )
}
