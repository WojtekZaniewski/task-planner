export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ThoughtType = 'thought' | 'goal' | 'achievement'
export type WorkspaceRole = 'owner' | 'admin' | 'member'
export type CalendarView = 'list' | 'kanban' | 'day' | 'week' | 'month'
export type AppMode = 'tasks' | 'calendar'
export type ThemePreference = 'light' | 'dark' | 'system'

export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  age: number | null
  goals: string[] | null
  role: string | null
  app_mode: AppMode
  theme: ThemePreference
  onboarding_completed: boolean
  created_at: string
}

export interface Workspace {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
}

export interface WorkspaceMember {
  workspace_id: string
  user_id: string
  role: WorkspaceRole
  joined_at: string
  profile?: Profile
}

export interface WorkspaceInvite {
  id: string
  workspace_id: string
  code: string
  created_by: string
  expires_at: string | null
  max_uses: number | null
  use_count: number
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  due_time: string | null
  workspace_id: string | null
  created_by: string
  assigned_to: string | null
  position: number
  created_at: string
  updated_at: string
  assigned_profile?: Profile
  creator_profile?: Profile
}

export interface Thought {
  id: string
  content: string
  type: ThoughtType
  workspace_id: string
  created_by: string
  created_at: string
  creator_profile?: Profile
}
