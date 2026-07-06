-- ═══════════════════════════════════════════════════════════════
-- NEXORA: Full Schema Migration
-- Run this ONCE in Supabase SQL Editor.
-- Order: 001_profiles → 002_core_tables → 003_execution_graph
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 001: PROFILES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  persona       TEXT,
  default_home  TEXT NOT NULL DEFAULT 'dashboard',
  planning_cadence TEXT NOT NULL DEFAULT 'daily',
  score_weights JSONB NOT NULL DEFAULT '{"tasks": 0.5, "focus": 0.3, "habits": 0.2}',
  visible_modules JSONB NOT NULL DEFAULT '["tasks","projects","goals","habits","focus","notes","research","news","calendar","analytics","assistant","settings"]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 002: CORE TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE public.workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL DEFAULT 'My Workspace',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.memberships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.project_status AS ENUM ('active', 'paused', 'completed', 'archived');

CREATE TABLE public.projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  status        public.project_status NOT NULL DEFAULT 'active',
  due_date      TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.task_status AS ENUM ('backlog', 'in_progress', 'review', 'completed');
CREATE TYPE public.task_priority AS ENUM ('urgent', 'high', 'medium', 'low');

CREATE TABLE public.tasks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id   UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  status         public.task_status NOT NULL DEFAULT 'backlog',
  priority       public.task_priority NOT NULL DEFAULT 'medium',
  due_date       TIMESTAMPTZ,
  project_id     UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  position       INT NOT NULL DEFAULT 0,
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  start_time    TIMESTAMPTZ NOT NULL,
  end_time      TIMESTAMPTZ NOT NULL,
  all_day       BOOLEAN NOT NULL DEFAULT false,
  task_id       UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.goal_timeframe AS ENUM ('yearly', 'quarterly', 'monthly');
CREATE TYPE public.goal_status AS ENUM ('active', 'at_risk', 'stalled', 'completed', 'archived');

CREATE TABLE public.goals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  timeframe     public.goal_timeframe NOT NULL,
  start_date    DATE NOT NULL,
  target_date   DATE NOT NULL,
  status        public.goal_status NOT NULL DEFAULT 'active',
  progress      INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.habit_frequency AS ENUM ('daily', 'weekly');

CREATE TABLE public.habits (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id   UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  frequency      public.habit_frequency NOT NULL DEFAULT 'daily',
  target_count   INT NOT NULL DEFAULT 1,
  streak_count   INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.habit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id      UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  workspace_id  UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date      DATE NOT NULL,
  count         INT NOT NULL DEFAULT 1,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(habit_id, log_date)
);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.focus_session_type AS ENUM ('pomodoro', 'stopwatch');

CREATE TABLE public.focus_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id          UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  session_type     public.focus_session_type NOT NULL DEFAULT 'pomodoro',
  start_time       TIMESTAMPTZ NOT NULL,
  end_time         TIMESTAMPTZ,
  duration_minutes INT,
  intent           TEXT,
  distractions     TEXT,
  notes            TEXT,
  completed        BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.note_folders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  parent_id     UUID REFERENCES public.note_folders(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.note_folders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT 'Untitled',
  content       TEXT,
  folder_id     UUID REFERENCES public.note_folders(id) ON DELETE SET NULL,
  pinned        BOOLEAN NOT NULL DEFAULT false,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.research (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  url             TEXT,
  source_type     TEXT,
  content_summary TEXT,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.research ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.news_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  url               TEXT,
  source            TEXT,
  summary           TEXT,
  topic             TEXT,
  read              BOOLEAN NOT NULL DEFAULT false,
  saved_to_research UUID REFERENCES public.research(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

-- RLS helper
CREATE OR REPLACE FUNCTION public.user_is_member(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
$$;

-- Workspace policies
CREATE POLICY "owner manage" ON public.workspaces FOR ALL
  USING (public.user_is_member(id));
CREATE POLICY "owner insert" ON public.workspaces FOR INSERT
  WITH CHECK (true);

-- Membership policies
CREATE POLICY "self only" ON public.memberships FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "self insert" ON public.memberships FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Entity RLS (applies to all: projects, tasks, events, goals, habits, habit_logs, focus_sessions, notes, note_folders, research, news_items)
CREATE POLICY "member access" ON public.projects FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.projects FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.projects FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.projects FOR DELETE USING (public.user_is_member(workspace_id));

CREATE POLICY "member access" ON public.tasks FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.tasks FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.tasks FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.tasks FOR DELETE USING (public.user_is_member(workspace_id));

CREATE POLICY "member access" ON public.events FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.events FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.events FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.events FOR DELETE USING (public.user_is_member(workspace_id));

CREATE POLICY "member access" ON public.goals FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.goals FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.goals FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.goals FOR DELETE USING (public.user_is_member(workspace_id));

CREATE POLICY "member access" ON public.habits FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.habits FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.habits FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.habits FOR DELETE USING (public.user_is_member(workspace_id));

CREATE POLICY "member access" ON public.habit_logs FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.habit_logs FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.habit_logs FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.habit_logs FOR DELETE USING (public.user_is_member(workspace_id));

CREATE POLICY "member access" ON public.focus_sessions FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.focus_sessions FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.focus_sessions FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.focus_sessions FOR DELETE USING (public.user_is_member(workspace_id));

CREATE POLICY "member access" ON public.notes FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.notes FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.notes FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.notes FOR DELETE USING (public.user_is_member(workspace_id));

CREATE POLICY "member access" ON public.note_folders FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.note_folders FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.note_folders FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.note_folders FOR DELETE USING (public.user_is_member(workspace_id));

CREATE POLICY "member access" ON public.research FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.research FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.research FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.research FOR DELETE USING (public.user_is_member(workspace_id));

CREATE POLICY "member access" ON public.news_items FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.news_items FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.news_items FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.news_items FOR DELETE USING (public.user_is_member(workspace_id));

-- Updated_at triggers for all tables
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_workspace_updated BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_project_updated  BEFORE UPDATE ON public.projects  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_task_updated     BEFORE UPDATE ON public.tasks     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_event_updated    BEFORE UPDATE ON public.events    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_goal_updated     BEFORE UPDATE ON public.goals     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_habit_updated    BEFORE UPDATE ON public.habits    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_note_updated     BEFORE UPDATE ON public.notes     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_note_folder_updated BEFORE UPDATE ON public.note_folders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_research_updated BEFORE UPDATE ON public.research  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 003: EXECUTION GRAPH + DECISION MEMORY + EVENT HISTORY
-- ─────────────────────────────────────────────────────────────

CREATE TYPE public.edge_type AS ENUM (
  'part_of', 'contributes_to', 'references', 'worked_on',
  'parent_of', 'depends_on', 'blocks', 'relates_to', 'triggered'
);

CREATE TYPE public.entity_type AS ENUM (
  'task', 'project', 'goal', 'habit', 'habit_log',
  'focus_session', 'note', 'research', 'news_item',
  'event', 'profile'
);

CREATE TABLE public.graph_edges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  source_type   public.entity_type NOT NULL,
  source_id     UUID NOT NULL,
  target_type   public.entity_type NOT NULL,
  target_id     UUID NOT NULL,
  edge_type     public.edge_type NOT NULL DEFAULT 'relates_to',
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_type, source_id, target_type, target_id, edge_type)
);

CREATE INDEX idx_graph_edges_source ON public.graph_edges(source_type, source_id);
CREATE INDEX idx_graph_edges_target ON public.graph_edges(target_type, target_id);
CREATE INDEX idx_graph_edges_workspace ON public.graph_edges(workspace_id);

ALTER TABLE public.graph_edges ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.decision_memory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_type    public.entity_type,
  context_id      UUID,
  action          TEXT NOT NULL,
  rationale       TEXT NOT NULL,
  outcome         TEXT,
  ai_generated    BOOLEAN NOT NULL DEFAULT false,
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_decision_context ON public.decision_memory(context_type, context_id);
CREATE INDEX idx_decision_created ON public.decision_memory(created_at DESC);

ALTER TABLE public.decision_memory ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.event_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type     public.entity_type NOT NULL,
  entity_id       UUID NOT NULL,
  event_type      TEXT NOT NULL,
  old_values      JSONB,
  new_values      JSONB,
  summary         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_history_entity ON public.event_history(entity_type, entity_id);
CREATE INDEX idx_event_history_user ON public.event_history(user_id, created_at DESC);
CREATE INDEX idx_event_history_workspace ON public.event_history(workspace_id, created_at DESC);

ALTER TABLE public.event_history ENABLE ROW LEVEL SECURITY;

-- Graph edges RLS
CREATE POLICY "member access" ON public.graph_edges FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.graph_edges FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.graph_edges FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.graph_edges FOR DELETE USING (public.user_is_member(workspace_id));

-- Decision memory RLS
CREATE POLICY "member access" ON public.decision_memory FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.decision_memory FOR INSERT WITH CHECK (public.user_is_member(workspace_id));

-- Event history RLS (append-only)
CREATE POLICY "member access" ON public.event_history FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.event_history FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
