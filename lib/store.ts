import { create } from 'zustand'

interface AppState {
  userName: string
  setUserName: (name: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  userName: '',
  setUserName: (name) => set({ userName: name }),
}))
