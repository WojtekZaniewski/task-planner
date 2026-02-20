import { create } from 'zustand'
import type { AppMode, CalendarView } from './types'

interface AppState {
  currentView: CalendarView
  setCurrentView: (view: CalendarView) => void
  appMode: AppMode
  setAppMode: (mode: AppMode) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'day',
  setCurrentView: (view) => set({ currentView: view }),
  appMode: 'calendar',
  setAppMode: (mode) => set({ appMode: mode }),
}))
