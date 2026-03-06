import { ThemeToggle } from '@/components/dashboard/theme-toggle'

export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] bg-background p-3 sm:p-4 transition-colors duration-300">
      <ThemeToggle />
      {children}
    </div>
  )
}
