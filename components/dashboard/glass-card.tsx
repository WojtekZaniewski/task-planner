import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass rounded-bento p-5 transition-all duration-300',
        hover && 'glass-hover glow-orange',
        className
      )}
    >
      {children}
    </div>
  )
}
