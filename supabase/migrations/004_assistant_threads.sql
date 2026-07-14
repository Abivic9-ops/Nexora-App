-- ─────────────────────────────────────────────────────────────
-- NEXORA: 004_assistant_threads.sql
-- Assistant threaded conversations + message history.
-- Run this AFTER 003_execution_graph.sql.
-- ─────────────────────────────────────────────────────────────

-- ═════════════════════════════════════════════════════════════
-- 1. ASSISTANT THREADS
-- ═════════════════════════════════════════════════════════════
CREATE TABLE public.assistant_threads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL DEFAULT 'New conversation',
  pinned          BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assistant_threads_user ON public.assistant_threads(user_id, updated_at DESC);
CREATE INDEX idx_assistant_threads_workspace ON public.assistant_threads(workspace_id);

ALTER TABLE public.assistant_threads ENABLE ROW LEVEL SECURITY;

-- ═════════════════════════════════════════════════════════════
-- 2. ASSISTANT MESSAGES
-- ═════════════════════════════════════════════════════════════
CREATE TYPE public.message_role AS ENUM ('user', 'assistant', 'system');

CREATE TABLE public.assistant_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id       UUID NOT NULL REFERENCES public.assistant_threads(id) ON DELETE CASCADE,
  workspace_id    UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            public.message_role NOT NULL,
  content         TEXT NOT NULL,
  model           TEXT,
  token_count     INTEGER,
  decision_id     UUID REFERENCES public.decision_memory(id) ON DELETE SET NULL,
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assistant_messages_thread ON public.assistant_messages(thread_id, created_at ASC);
CREATE INDEX idx_assistant_messages_workspace ON public.assistant_messages(workspace_id);

ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;

-- ═════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═════════════════════════════════════════════════════════════

-- Threads
CREATE POLICY "member access" ON public.assistant_threads FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.assistant_threads FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member update" ON public.assistant_threads FOR UPDATE USING (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.assistant_threads FOR DELETE USING (public.user_is_member(workspace_id));

-- Messages
CREATE POLICY "member access" ON public.assistant_messages FOR SELECT USING (public.user_is_member(workspace_id));
CREATE POLICY "member insert" ON public.assistant_messages FOR INSERT WITH CHECK (public.user_is_member(workspace_id));
CREATE POLICY "member delete" ON public.assistant_messages FOR DELETE USING (public.user_is_member(workspace_id));
