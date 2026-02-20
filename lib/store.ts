import { create } from 'zustand'
import type { AppMode, CalendarView } from './types'

interface AppState {
  currentView: CalendarView
  setCurrentView: (view: CalendarView) => void
  appMode: AppMode
  setAppMode: (mode: AppMode) => void
  userName: string
  setUserName: (name: string) => void
  avatarUrl: string | null
  setAvatarUrl: (url: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'day',
  setCurrentView: (view) => set({ currentView: view }),
  appMode: 'calendar',
  setAppMode: (mode) => set({ appMode: mode }),
  userName: '',
  setUserName: (name) => set({ userName: name }),
  avatarUrl: null,
  setAvatarUrl: (url) => set({ avatarUrl: url }),
}))
