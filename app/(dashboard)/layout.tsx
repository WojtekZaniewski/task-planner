export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[100dvh] overflow-hidden bg-background p-3 sm:p-4">
      {children}
    </div>
  )
}
