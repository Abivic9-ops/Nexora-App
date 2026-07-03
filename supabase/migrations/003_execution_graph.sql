-- ─────────────────────────────────────────────────────────────
-- NEXORA: 003_execution_graph.sql
-- Unified Execution Graph, Decision Memory, and Event History.
-- Run this AFTER 002_core_tables.sql.
-- ─────────────────────────────────────────────────────────────

-- ═════════════════════════════════════════════════════════════
-- 1. GRAPH EDGES
--
-- This is the Unified Execution Graph. It links any entity to
-- any other entity. Examples:
--   task → project       ("part_of")
--   task → goal          ("contributes_to")
--   note → task          ("references")
--   focus_session → task ("worked_on")
--   goal → goal          ("parent_of" — sub-goals)
--
-- The source/target is defined by (entity_type, entity_id).
-- This avoids polymorphic foreign keys and keeps the schema
-- simple and indexable.
-- ═════════════════════════════════════════════════════════════
CREATE TYPE public.edge_type AS ENUM (
  'part_of',          -- entity A is part of entity B  (task → project)
  'contributes_to',   -- entity A contributes to B     (task → goal)
  'references',       -- entity A references B         (note → task)
  'worked_on',        -- entity A was work on B        (focus → task)
  'parent_of',        -- entity A is parent of B       (goal → goal)
  'depends_on',       -- entity A depends on B         (task → task)
  'blocks',           -- entity A blocks B             (task → task)
  'relates_to',       -- generic link                  (any → any)
  'triggered'         -- automation event              (rule → action)
);

-- Allowed entity type names (must match table names)
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
  metadata      JSONB,  -- optional: weight, description, etc.
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_type, source_id, target_type, target_id, edge_type)
);

-- Indexes for fast graph queries
CREATE INDEX idx_graph_edges_source ON public.graph_edges(source_type, source_id);
CREATE INDEX idx_graph_edges_target ON public.graph_edges(target_type, target_id);
CREATE INDEX idx_graph_edges_workspace ON public.graph_edges(workspace_id);

ALTER TABLE public.graph_edges ENABLE ROW LEVEL SECURITY;

-- ═════════════════════════════════════════════════════════════
-- 2. DECISION MEMORY
--
-- Every AI action stores its rationale here. This powers:
--   - "Why did the assistant recommend this?"
--   - Audit trail of AI-influenced decisions
--   - Learning: the AI can reference past decisions
-- ═════════════════════════════════════════════════════════════
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

-- ═════════════════════════════════════════════════════════════
-- 3. EVENT HISTORY (Audit Log)
--
-- Records every meaningful change to every entity.
-- Used for:
--   - Activity feed on Dashboard
--   - Undo operations
--   - Analytics (what changed, when, by whom)
--   - "What moved my score today" feature
-- ═════════════════════════════════════════════════════════════
CREATE TABLE public.event_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type     public.entity_type NOT NULL,
  entity_id       UUID NOT NULL,
  event_type      TEXT NOT NULL,  -- 'created', 'updated', 'completed', 'deleted', 'status_changed', etc.
  old_values      JSONB,
  new_values      JSONB,
  summary         TEXT,           -- human-readable: "Completed task 'Design audit'"
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_history_entity ON public.event_history(entity_type, entity_id);
CREATE INDEX idx_event_history_user ON public.event_history(user_id, created_at DESC);
CREATE INDEX idx_event_history_workspace ON public.event_history(workspace_id, created_at DESC);

ALTER TABLE public.event_history ENABLE ROW LEVEL SECURITY;

-- ═════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═════════════════════════════════════════════════════════════

-- Graph edges
CREATE POLICY "member access" ON public.graph_edges FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.graph_edges FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.graph_edges FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.graph_edges FOR DELETE USING (public.user_is_member(workspace_id));

-- Decision memory
CREATE POLICY "member access" ON public.decision_memory FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.decision_memory FOR INSERT WITH CHECK (public.user_is_member(workspace_id));

-- Event history (append-only: no update/delete)
CREATE POLICY "member access" ON public.event_history FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.event_history FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
