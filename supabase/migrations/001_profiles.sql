-- ─────────────────────────────────────────────────────────────
-- NEXORA: 001_profiles.sql
-- 
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- or via `supabase migration up` if using Supabase CLI.
-- ─────────────────────────────────────────────────────────────

-- 1. Create the profiles table
--    Each row corresponds to one auth user (id = auth.users.id).
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  persona       TEXT,                          -- "founder" | "engineer" | "creator" | "student"
  default_home  TEXT NOT NULL DEFAULT 'dashboard',  -- which surface loads first
  planning_cadence TEXT NOT NULL DEFAULT 'daily',    -- "daily" | "weekly"
  score_weights JSONB NOT NULL DEFAULT '{"tasks": 0.5, "focus": 0.3, "habits": 0.2}',
  visible_modules JSONB NOT NULL DEFAULT '["tasks","projects","goals","habits","focus","notes","research","news","calendar","analytics","assistant","settings"]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row-Level Security
--    Without this, any user could read any other user's profile.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
--    These are the rules enforced at the database level.

-- 3a. Users can read their own profile only.
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 3b. Users can insert their own profile (triggered on sign-up).
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3c. Users can update their own profile (onboarding, settings changes).
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3d. Users can delete their own profile (account deletion).
CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- 4. Auto-create profile on sign-up trigger
--    When a new user signs up (insert into auth.users),
--    this function automatically creates their profile row.
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

-- 5. Attach the trigger to auth.users
--    Every INSERT on auth.users fires handle_new_user().
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Auto-update updated_at trigger
--    Keeps updated_at current whenever a row changes.
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

CREATE OR REPLACE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
