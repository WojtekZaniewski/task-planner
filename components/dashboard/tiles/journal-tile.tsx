'use client'

import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/dashboard/glass-card'
import { BookOpen } from 'lucide-react'
import { useJournal } from '@/lib/hooks/use-journal'
import { useTranslations } from '@/lib/i18n'

export function JournalTile() {
  const router = useRouter()
  const { completedMissions } = useJournal()
  const t = useTranslations()

  return (
    <GlassCard
      className="bento-1x1 flex flex-col items-center justify-center gap-3 cursor-pointer"
      hover
    >
      <div onClick={() => router.push('/journal')} className="flex flex-col items-center justify-center gap-3 w-full h-full">
        <div className="relative">
          <BookOpen className="h-8 w-8 text-primary" />
          {completedMissions.length > 0 && (
            <span className="absolute -top-1.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {completedMissions.length}
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-foreground">{t.nav.journal}</p>
        <p className="text-xs text-muted-foreground text-center">
          {completedMissions.length === 0
            ? t.journal.noCompletedShort
            : t.journal.missionsCount(completedMissions.length)}
        </p>
      </div>
    </GlassCard>
  )
}
