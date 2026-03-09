export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface MissionGoal {
  name: string
  target: number
  startedAt?: string
  deadline?: string
  moneyGoal?: number
  moneyBalance?: number
}

export interface MissionRow {
  id: string
  user_id: string
  name: string
  target: number
  started_at: string
  completed_at: string | null
  deadline: string | null
  money_goal: number | null
  money_balance: number | null
  tasks_completed: number | null
  created_at: string
}

export interface MissionThoughtRow {
  id: string
  user_id: string
  mission_id: string
  text: string
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
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
  created_by: string
  position: number
  created_at: string
  updated_at: string
}

export interface Thought {
  id: string
  text: string
  createdAt: string
  missionId?: string
}

export interface CompletedMission {
  id: string
  name: string
  target: number
  tasksCompleted: number
  startedAt: string
  completedAt: string
  deadline?: string
  moneyGoal?: number
  thoughts: Thought[]
}

export interface VoiceNoteRow {
  id: string
  user_id: string
  mission_id: string
  storage_path: string
  duration_seconds: number | null
  created_at: string
}

export interface VoiceNote {
  id: string
  missionId: string
  storagePath: string
  durationSeconds: number | null
  createdAt: string
  signedUrl?: string
}
