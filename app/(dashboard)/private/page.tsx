'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { DashboardBento } from '@/components/dashboard/dashboard-bento'
import { useTasks } from '@/lib/hooks/use-tasks'
import type { AppMode } from '@/lib/types'

export default function PrivatePage() {
  const {
    userName, setUserName,
    avatarUrl, setAvatarUrl,
    workspaceCount, setWorkspaceCount,
    setAppMode,
  } = useAppStore()
  const { tasks } = useTasks({ isPrivate: true })

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

  const todoCount = tasks.filter(t => t.status === 'todo').length
  const firstName = userName.split(' ')[0] || 'Użytkownik'
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <div className="mx-auto max-w-3xl flex items-center min-h-[calc(100vh-6rem)]">
      <DashboardBento
        firstName={firstName}
        avatarUrl={avatarUrl}
        initials={initials}
        todoCount={todoCount}
        workspaceCount={workspaceCount}
      />
    </div>
  )
}
