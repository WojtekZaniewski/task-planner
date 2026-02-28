// ---- Tools ----
export type IndustryType = 'technology' | 'retail' | 'financial' | 'manufacturing' | 'healthcare'
export type AnalysisType = 'financial_ratios' | 'brand_validation' | 'dcf_model'
export type RatioRating = 'excellent' | 'good' | 'acceptable' | 'poor'

export interface FinancialStatements {
  income_statement: {
    revenue: number
    cost_of_goods_sold: number
    operating_income: number
    ebit: number
    ebitda: number
    interest_expense: number
    net_income: number
  }
  balance_sheet: {
    total_assets: number
    current_assets: number
    cash_and_equivalents: number
    accounts_receivable: number
    inventory: number
    current_liabilities: number
    total_debt: number
    current_portion_long_term_debt: number
    shareholders_equity: number
  }
  cash_flow: {
    operating_cash_flow: number
    investing_cash_flow: number
    financing_cash_flow: number
  }
  market_data: {
    share_price: number
    shares_outstanding: number
    earnings_growth_rate: number
  }
}

export interface RatioResult {
  name: string
  value: number
  formatted: string
  interpretation: string
  rating: RatioRating
  recommendation: string
}

export interface RatioCategory {
  name: string
  ratios: RatioResult[]
}

export interface BrandGuidelines {
  brand_name: string
  primary_colors: string[]
  secondary_colors: string[]
  fonts: string[]
  tone_keywords: string[]
  prohibited_words: string[]
  tagline?: string
}

export interface BrandValidationResult {
  passed: boolean
  score: number
  violations: string[]
  warnings: string[]
  suggestions: string[]
}

export interface DCFAssumptions {
  projection_years: number
  revenue_growth: number[]
  ebitda_margin: number[]
  tax_rate: number
  capex_percent: number
  nwc_percent: number
  risk_free_rate: number
  equity_risk_premium: number
  beta: number
  cost_of_debt: number
  debt_to_equity: number
  terminal_growth_rate: number
}

export interface DCFProjection {
  year: number
  revenue: number
  ebitda: number
  ebit: number
  nopat: number
  capex: number
  nwc_change: number
  free_cash_flow: number
  discount_factor: number
  present_value: number
}

export interface DCFResult {
  company_name: string
  assumptions: DCFAssumptions
  wacc: number
  projections: DCFProjection[]
  terminal_value: number
  pv_terminal: number
  pv_fcf: number
  enterprise_value: number
  net_debt: number
  cash: number
  equity_value: number
  shares_outstanding: number
  per_share_value: number
  sensitivity_table: {
    row_label: string
    col_label: string
    row_values: number[]
    col_values: number[]
    values: number[][]
  }
}

export interface SavedAnalysis {
  id: string
  type: AnalysisType
  name: string
  data: Record<string, unknown>
  created_by: string
  created_at: string
  updated_at: string
}

// ---- Existing Types ----
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ThoughtType = 'thought' | 'goal' | 'achievement'
export type JournalEntryType = 'note' | 'achieved_goal' | 'improvement'
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

export interface JournalEntry {
  id: string
  content: string
  type: JournalEntryType
  workspace_id: string | null
  created_by: string
  created_at: string
  updated_at: string
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
