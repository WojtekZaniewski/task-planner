import { create } from 'zustand'
import type { CalendarView } from './types'

interface AppState {
  currentView: CalendarView
  setCurrentView: (view: CalendarView) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'list',
  setCurrentView: (view) => set({ currentView: view }),
}))
