export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ── Enums ──

export type TaskStatus = "backlog" | "in_progress" | "review" | "completed"
export type TaskPriority = "urgent" | "high" | "medium" | "low"
export type ProjectStatus = "active" | "paused" | "completed" | "archived"
export type GoalTimeframe = "yearly" | "quarterly" | "monthly"
export type GoalStatus = "active" | "at_risk" | "stalled" | "completed" | "archived"
export type HabitFrequency = "daily" | "weekly"
export type FocusSessionType = "pomodoro" | "stopwatch"
export type EdgeType =
  | "part_of" | "contributes_to" | "references" | "worked_on"
  | "parent_of" | "depends_on" | "blocks" | "relates_to" | "triggered"
export type EntityType =
  | "task" | "project" | "goal" | "habit" | "habit_log"
  | "focus_session" | "note" | "research" | "news_item"
  | "event" | "profile"

// ── Flat Row types ──

export type Profile = {
  id: string; email: string; full_name: string | null; avatar_url: string | null
  persona: string | null; default_home: string; planning_cadence: string
  score_weights: Json; visible_modules: Json; created_at: string; updated_at: string
}
export type ProfileInsert = {
  id: string; email: string; full_name?: string | null; avatar_url?: string | null
  persona?: string | null; default_home?: string; planning_cadence?: string
  score_weights?: Json; visible_modules?: Json; created_at?: string; updated_at?: string
}
export type ProfileUpdate = {
  id?: string; email?: string; full_name?: string | null; avatar_url?: string | null
  persona?: string | null; default_home?: string; planning_cadence?: string
  score_weights?: Json; visible_modules?: Json; created_at?: string; updated_at?: string
}

export type Workspace = { id: string; name: string; created_at: string; updated_at: string }
export type WorkspaceInsert = { id?: string; name?: string; created_at?: string; updated_at?: string }
export type WorkspaceUpdate = { id?: string; name?: string; created_at?: string; updated_at?: string }

export type Membership = { id: string; workspace_id: string; user_id: string; role: string; created_at: string }
export type MembershipInsert = { id?: string; workspace_id: string; user_id: string; role?: string; created_at?: string }
export type MembershipUpdate = { id?: string; workspace_id?: string; user_id?: string; role?: string; created_at?: string }

export type Task = {
  id: string; workspace_id: string; user_id: string; title: string
  description: string | null; status: TaskStatus; priority: TaskPriority
  due_date: string | null; project_id: string | null; parent_task_id: string | null
  position: number; completed_at: string | null; created_at: string; updated_at: string
}
export type TaskInsert = {
  id?: string; workspace_id: string; user_id: string; title: string
  description?: string | null; status?: TaskStatus; priority?: TaskPriority
  due_date?: string | null; project_id?: string | null; parent_task_id?: string | null
  position?: number; completed_at?: string | null; created_at?: string; updated_at?: string
}
export type TaskUpdate = {
  id?: string; workspace_id?: string; user_id?: string; title?: string
  description?: string | null; status?: TaskStatus; priority?: TaskPriority
  due_date?: string | null; project_id?: string | null; parent_task_id?: string | null
  position?: number; completed_at?: string | null; created_at?: string; updated_at?: string
}

export type Project = {
  id: string; workspace_id: string; user_id: string; name: string
  description: string | null; status: ProjectStatus; due_date: string | null
  completed_at: string | null; created_at: string; updated_at: string
}
export type ProjectInsert = {
  id?: string; workspace_id: string; user_id: string; name: string
  description?: string | null; status?: ProjectStatus; due_date?: string | null
  completed_at?: string | null; created_at?: string; updated_at?: string
}
export type ProjectUpdate = {
  id?: string; workspace_id?: string; user_id?: string; name?: string
  description?: string | null; status?: ProjectStatus; due_date?: string | null
  completed_at?: string | null; created_at?: string; updated_at?: string
}

export type Event = {
  id: string; workspace_id: string; user_id: string; title: string
  description: string | null; start_time: string; end_time: string
  all_day: boolean; task_id: string | null; created_at: string; updated_at: string
}
export type EventInsert = {
  id?: string; workspace_id: string; user_id: string; title: string
  description?: string | null; start_time: string; end_time: string
  all_day?: boolean; task_id?: string | null; created_at?: string; updated_at?: string
}
export type EventUpdate = {
  id?: string; workspace_id?: string; user_id?: string; title?: string
  description?: string | null; start_time?: string; end_time?: string
  all_day?: boolean; task_id?: string | null; created_at?: string; updated_at?: string
}

export type Goal = {
  id: string; workspace_id: string; user_id: string; title: string
  description: string | null; timeframe: GoalTimeframe; start_date: string
  target_date: string; status: GoalStatus; progress: number
  created_at: string; updated_at: string
}
export type GoalInsert = {
  id?: string; workspace_id: string; user_id: string; title: string
  description?: string | null; timeframe: GoalTimeframe; start_date: string
  target_date: string; status?: GoalStatus; progress?: number
  created_at?: string; updated_at?: string
}
export type GoalUpdate = {
  id?: string; workspace_id?: string; user_id?: string; title?: string
  description?: string | null; timeframe?: GoalTimeframe; start_date?: string
  target_date?: string; status?: GoalStatus; progress?: number
  created_at?: string; updated_at?: string
}

export type Habit = {
  id: string; workspace_id: string; user_id: string; name: string
  description: string | null; frequency: HabitFrequency; target_count: number
  streak_count: number; longest_streak: number; created_at: string; updated_at: string
}
export type HabitInsert = {
  id?: string; workspace_id: string; user_id: string; name: string
  description?: string | null; frequency?: HabitFrequency; target_count?: number
  streak_count?: number; longest_streak?: number; created_at?: string; updated_at?: string
}
export type HabitUpdate = {
  id?: string; workspace_id?: string; user_id?: string; name?: string
  description?: string | null; frequency?: HabitFrequency; target_count?: number
  streak_count?: number; longest_streak?: number; created_at?: string; updated_at?: string
}

export type HabitLog = {
  id: string; habit_id: string; workspace_id: string; user_id: string
  log_date: string; count: number; notes: string | null; created_at: string
}
export type HabitLogInsert = {
  id?: string; habit_id: string; workspace_id: string; user_id: string
  log_date: string; count?: number; notes?: string | null; created_at?: string
}
export type HabitLogUpdate = {
  id?: string; habit_id?: string; workspace_id?: string; user_id?: string
  log_date?: string; count?: number; notes?: string | null; created_at?: string
}

export type FocusSession = {
  id: string; workspace_id: string; user_id: string; task_id: string | null
  session_type: FocusSessionType; start_time: string; end_time: string | null
  duration_minutes: number | null; intent: string | null; distractions: string | null
  notes: string | null; completed: boolean; created_at: string
}
export type FocusSessionInsert = {
  id?: string; workspace_id: string; user_id: string; task_id?: string | null
  session_type?: FocusSessionType; start_time: string; end_time?: string | null
  duration_minutes?: number | null; intent?: string | null; distractions?: string | null
  notes?: string | null; completed?: boolean; created_at?: string
}
export type FocusSessionUpdate = {
  id?: string; workspace_id?: string; user_id?: string; task_id?: string | null
  session_type?: FocusSessionType; start_time?: string; end_time?: string | null
  duration_minutes?: number | null; intent?: string | null; distractions?: string | null
  notes?: string | null; completed?: boolean; created_at?: string
}

export type NoteFolder = {
  id: string; workspace_id: string; user_id: string; name: string
  parent_id: string | null; created_at: string; updated_at: string
}
export type NoteFolderInsert = {
  id?: string; workspace_id: string; user_id: string; name: string
  parent_id?: string | null; created_at?: string; updated_at?: string
}
export type NoteFolderUpdate = {
  id?: string; workspace_id?: string; user_id?: string; name?: string
  parent_id?: string | null; created_at?: string; updated_at?: string
}

export type Note = {
  id: string; workspace_id: string; user_id: string; title: string
  content: string | null; folder_id: string | null; pinned: boolean
  tags: string[]; created_at: string; updated_at: string
}
export type NoteInsert = {
  id?: string; workspace_id: string; user_id: string; title?: string
  content?: string | null; folder_id?: string | null; pinned?: boolean
  tags?: string[]; created_at?: string; updated_at?: string
}
export type NoteUpdate = {
  id?: string; workspace_id?: string; user_id?: string; title?: string
  content?: string | null; folder_id?: string | null; pinned?: boolean
  tags?: string[]; created_at?: string; updated_at?: string
}

export type Research = {
  id: string; workspace_id: string; user_id: string; title: string
  url: string | null; source_type: string | null; content_summary: string | null
  tags: string[]; created_at: string; updated_at: string
}
export type ResearchInsert = {
  id?: string; workspace_id: string; user_id: string; title: string
  url?: string | null; source_type?: string | null; content_summary?: string | null
  tags?: string[]; created_at?: string; updated_at?: string
}
export type ResearchUpdate = {
  id?: string; workspace_id?: string; user_id?: string; title?: string
  url?: string | null; source_type?: string | null; content_summary?: string | null
  tags?: string[]; created_at?: string; updated_at?: string
}

export type NewsItem = {
  id: string; workspace_id: string; user_id: string; title: string
  url: string | null; source: string | null; summary: string | null
  topic: string | null; read: boolean; saved_to_research: string | null
  created_at: string
}
export type NewsItemInsert = {
  id?: string; workspace_id: string; user_id: string; title: string
  url?: string | null; source?: string | null; summary?: string | null
  topic?: string | null; read?: boolean; saved_to_research?: string | null
  created_at?: string
}
export type NewsItemUpdate = {
  id?: string; workspace_id?: string; user_id?: string; title?: string
  url?: string | null; source?: string | null; summary?: string | null
  topic?: string | null; read?: boolean; saved_to_research?: string | null
  created_at?: string
}

export type GraphEdge = {
  id: string; workspace_id: string; source_type: EntityType; source_id: string
  target_type: EntityType; target_id: string; edge_type: EdgeType
  metadata: Json | null; created_at: string
}
export type GraphEdgeInsert = {
  id?: string; workspace_id: string; source_type: EntityType; source_id: string
  target_type: EntityType; target_id: string; edge_type?: EdgeType
  metadata?: Json | null; created_at?: string
}
export type GraphEdgeUpdate = {
  id?: string; workspace_id?: string; source_type?: EntityType; source_id?: string
  target_type?: EntityType; target_id?: string; edge_type?: EdgeType
  metadata?: Json | null; created_at?: string
}

export type DecisionMemory = {
  id: string; workspace_id: string; user_id: string; context_type: EntityType | null
  context_id: string | null; action: string; rationale: string; outcome: string | null
  ai_generated: boolean; metadata: Json | null; created_at: string
}
export type DecisionMemoryInsert = {
  id?: string; workspace_id: string; user_id: string; context_type?: EntityType | null
  context_id?: string | null; action: string; rationale: string; outcome?: string | null
  ai_generated?: boolean; metadata?: Json | null; created_at?: string
}
export type DecisionMemoryUpdate = {
  id?: string; workspace_id?: string; user_id?: string; context_type?: EntityType | null
  context_id?: string | null; action?: string; rationale?: string; outcome?: string | null
  ai_generated?: boolean; metadata?: Json | null; created_at?: string
}

export type EventHistory = {
  id: string; workspace_id: string; user_id: string; entity_type: EntityType
  entity_id: string; event_type: string; old_values: Json | null
  new_values: Json | null; summary: string | null; created_at: string
}
export type EventHistoryInsert = {
  id?: string; workspace_id: string; user_id: string; entity_type: EntityType
  entity_id: string; event_type: string; old_values?: Json | null
  new_values?: Json | null; summary?: string | null; created_at?: string
}

// ── Database interface (for Supabase client generic) ──

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile; Insert: ProfileInsert; Update: ProfileUpdate
      }
      workspaces: {
        Row: Workspace; Insert: WorkspaceInsert; Update: WorkspaceUpdate
      }
      memberships: {
        Row: Membership; Insert: MembershipInsert; Update: MembershipUpdate
      }
      tasks: {
        Row: Task; Insert: TaskInsert; Update: TaskUpdate
      }
      projects: {
        Row: Project; Insert: ProjectInsert; Update: ProjectUpdate
      }
      events: {
        Row: Event; Insert: EventInsert; Update: EventUpdate
      }
      goals: {
        Row: Goal; Insert: GoalInsert; Update: GoalUpdate
      }
      habits: {
        Row: Habit; Insert: HabitInsert; Update: HabitUpdate
      }
      habit_logs: {
        Row: HabitLog; Insert: HabitLogInsert; Update: HabitLogUpdate
      }
      focus_sessions: {
        Row: FocusSession; Insert: FocusSessionInsert; Update: FocusSessionUpdate
      }
      note_folders: {
        Row: NoteFolder; Insert: NoteFolderInsert; Update: NoteFolderUpdate
      }
      notes: {
        Row: Note; Insert: NoteInsert; Update: NoteUpdate
      }
      research: {
        Row: Research; Insert: ResearchInsert; Update: ResearchUpdate
      }
      news_items: {
        Row: NewsItem; Insert: NewsItemInsert; Update: NewsItemUpdate
      }
      graph_edges: {
        Row: GraphEdge; Insert: GraphEdgeInsert; Update: GraphEdgeUpdate
      }
      decision_memory: {
        Row: DecisionMemory; Insert: DecisionMemoryInsert; Update: DecisionMemoryUpdate
      }
      event_history: {
        Row: EventHistory; Insert: EventHistoryInsert; Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
