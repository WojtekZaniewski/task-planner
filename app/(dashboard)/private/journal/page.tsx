'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { JournalSummary } from '@/components/journal/journal-summary'
import { JournalSection } from '@/components/journal/journal-section'

export default function JournalPage() {
  const { setUserName, setAvatarUrl, setWorkspaceCount } = useAppStore()

  useEffect(() => {
    const container = document.querySelector('[data-user-name]')
    if (container) {
      const name = container.getAttribute('data-user-name') || ''
      const avatar = container.getAttribute('data-avatar-url') || null
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
