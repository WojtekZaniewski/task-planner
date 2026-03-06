export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

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
