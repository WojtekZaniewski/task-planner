'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { JournalSummary } from '@/components/journal/journal-summary'
import { JournalSection } from '@/components/journal/journal-section'
import type { AppMode } from '@/lib/types'

export default function JournalPage() {
  const { setAppMode, setUserName, setAvatarUrl, setWorkspaceCount } = useAppStore()

  useEffect(() => {
    const container = document.querySelector('[data-app-mode]')
    if (container) {
      const mode = container.getAttribute('data-app-mode') as AppMode
      const name = container.getAttribute('data-user-name') || ''
      const avatar = container.getAttribute('data-avatar-url') || null
      if (mode) setAppMode(mode)
      if (name) setUserName(name)
      if (avatar) setAvatarUrl(avatar)
      const wsCount = parseInt(container.getAttribute('data-workspace-count') || '0', 10)
      setWorkspaceCount(wsCount)
    }
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <JournalSummary />
      <JournalSection isPrivate />
    </div>
  )
}
