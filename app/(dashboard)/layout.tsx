import { BottomNav } from '@/components/dashboard/bottom-nav'
import { PageTransition } from '@/components/dashboard/page-transition'

export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] bg-background p-3 pb-20 sm:p-4 sm:pb-20 transition-colors duration-300">
      <PageTransition>{children}</PageTransition>
      <BottomNav />
    </div>
  )
}
