import { create } from 'zustand'

interface AppState {
  userName: string
  setUserName: (name: string) => void
  avatarUrl: string | null
  setAvatarUrl: (url: string | null) => void
  workspaceCount: number
  setWorkspaceCount: (count: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  userName: '',
  setUserName: (name) => set({ userName: name }),
  avatarUrl: null,
  setAvatarUrl: (url) => set({ avatarUrl: url }),
  workspaceCount: 0,
  setWorkspaceCount: (count) => set({ workspaceCount: count }),
}))
