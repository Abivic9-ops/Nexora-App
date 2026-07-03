-- ─────────────────────────────────────────────────────────────
-- NEXORA: 002_core_tables.sql
-- Core entity tables for all 12 surfaces.
-- Run this AFTER 001_profiles.sql in Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────

-- ═════════════════════════════════════════════════════════════
-- TABLE ORDER (dependencies resolved):
--   1. workspaces       (no dependencies)
--   2. memberships      (depends on workspaces, auth.users)
--   3. projects         (depends on workspaces, auth.users)
--   4. tasks            (depends on workspaces, auth.users, projects, tasks)
--   5. events           (depends on workspaces, auth.users, tasks)
--   6. goals            (depends on workspaces, auth.users)
--   7. habits           (depends on workspaces, auth.users)
--   8. habit_logs       (depends on workspaces, auth.users, habits)
--   9. focus_sessions   (depends on workspaces, auth.users, tasks)
--  10. note_folders     (depends on workspaces, auth.users, note_folders)
--  11. notes            (depends on workspaces, auth.users, note_folders)
--  12. research         (depends on workspaces, auth.users)
--  13. news_items       (depends on workspaces, auth.users, research)
-- ═════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. WORKSPACES
-- Top-level container. Single-user now, multi-tenant ready.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL DEFAULT 'My Workspace',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- 2. MEMBERSHIPS
-- Links a user to a workspace with a role.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.memberships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- 3. PROJECTS
-- Groups of tasks. Progress is auto-derived from linked tasks.
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- 4. TASKS
-- Kanban tasks: status column, priority, project link, subtasks.
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- 5. EVENTS (Calendar)
-- All-day or timed calendar events, optionally linked to a task.
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- 6. GOALS
-- Yearly, quarterly, monthly vision cards with progress tracking.
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- 7. HABITS
-- Habit definitions with frequency and streak counters.
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- 8. HABIT LOGS
-- One row per habit per day — the daily check-in record.
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- 9. FOCUS SESSIONS
-- Pomodoro or stopwatch deep-work sessions.
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- 10. NOTE FOLDERS
-- Tree-structured folders for organising notes.
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- 11. NOTES
-- Rich-text notes (TipTap content), with folder, pin, and tags.
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- 12. RESEARCH
-- Saved research sources with AI-distilled summaries.
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- 13. NEWS ITEMS
-- AI-briefed articles; saveable to Research in one click.
-- ─────────────────────────────────────────────────────────────
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

-- ═════════════════════════════════════════════════════════════
-- RLS POLICIES
-- Every table uses the same pattern: user must be a workspace
-- member to SELECT, INSERT, UPDATE, or DELETE rows.
-- ═════════════════════════════════════════════════════════════

-- Helper function: is this user a member of the given workspace?
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

-- Workspaces
CREATE POLICY "owner manage" ON public.workspaces FOR ALL
  USING (public.user_is_member(id));
CREATE POLICY "owner insert" ON public.workspaces FOR INSERT
  WITH CHECK (true);

-- Memberships
CREATE POLICY "self only" ON public.memberships FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "self insert" ON public.memberships FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Generic RLS macro for all entity tables
-- (Applied manually since PostgreSQL does not support dynamic SQL in policies)

-- Projects
CREATE POLICY "member access" ON public.projects FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.projects FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.projects FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.projects FOR DELETE USING (public.user_is_member(workspace_id));

-- Tasks
CREATE POLICY "member access" ON public.tasks FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.tasks FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.tasks FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.tasks FOR DELETE USING (public.user_is_member(workspace_id));

-- Events
CREATE POLICY "member access" ON public.events FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.events FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.events FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.events FOR DELETE USING (public.user_is_member(workspace_id));

-- Goals
CREATE POLICY "member access" ON public.goals FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.goals FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.goals FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.goals FOR DELETE USING (public.user_is_member(workspace_id));

-- Habits
CREATE POLICY "member access" ON public.habits FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.habits FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.habits FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.habits FOR DELETE USING (public.user_is_member(workspace_id));

-- Habit logs
CREATE POLICY "member access" ON public.habit_logs FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.habit_logs FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.habit_logs FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.habit_logs FOR DELETE USING (public.user_is_member(workspace_id));

-- Focus sessions
CREATE POLICY "member access" ON public.focus_sessions FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.focus_sessions FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.focus_sessions FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.focus_sessions FOR DELETE USING (public.user_is_member(workspace_id));

-- Notes
CREATE POLICY "member access" ON public.notes FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.notes FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.notes FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.notes FOR DELETE USING (public.user_is_member(workspace_id));

-- Note folders
CREATE POLICY "member access" ON public.note_folders FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.note_folders FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.note_folders FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.note_folders FOR DELETE USING (public.user_is_member(workspace_id));

-- Research
CREATE POLICY "member access" ON public.research FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.research FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.research FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.research FOR DELETE USING (public.user_is_member(workspace_id));

-- News items
CREATE POLICY "member access" ON public.news_items FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.news_items FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.news_items FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.news_items FOR DELETE USING (public.user_is_member(workspace_id));

-- ═════════════════════════════════════════════════════════════
-- UPDATED_AT TRIGGERS
-- Every table with an updated_at column gets auto-updated.
-- ═════════════════════════════════════════════════════════════

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

CREATE TRIGGER on_workspace_updated BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_project_updated  BEFORE UPDATE ON public.projects  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_task_updated     BEFORE UPDATE ON public.tasks     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_event_updated    BEFORE UPDATE ON public.events    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_goal_updated     BEFORE UPDATE ON public.goals     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_habit_updated    BEFORE UPDATE ON public.habits    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_note_updated     BEFORE UPDATE ON public.notes     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_note_folder_updated BEFORE UPDATE ON public.note_folders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_research_updated BEFORE UPDATE ON public.research  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
