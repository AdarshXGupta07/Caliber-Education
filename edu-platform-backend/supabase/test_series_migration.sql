-- ═══════════════════════════════════════════════════════════════════════════
-- Caliber Education — Test Series (written, mentor-evaluated) schema
-- Run this ONCE in the Supabase SQL Editor, on PRODUCTION and STAGING, after
-- production_hardening_migration.sql.
--
-- Mirrors the existing mcq_subjects / mcq_bundles / mcq_enrollments pattern
-- deliberately — same shape, same conventions, kept as an independent system
-- from the MCQ hierarchy (no shared tables) so the two products never
-- entangle. Papers themselves live in the existing `tests` table — this
-- just adds a subject/catalog layer on top of it.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Catalog: individual subjects ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.test_series_subjects (
  id text PRIMARY KEY,                 -- e.g. 'ts-final-fr'
  level text NOT NULL,                 -- 'FOUNDATION' | 'INTERMEDIATE' | 'FINAL'
  group_name text NOT NULL DEFAULT 'NONE',  -- 'GROUP_1' | 'GROUP_2' | 'NONE'
  name text NOT NULL,
  code text NOT NULL,
  description text DEFAULT '',
  price numeric,                       -- NULL until admin sets it — one-time price, not duration-tiered
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Catalog: bundles (Group 1 / Group 2 / Both Groups / Complete) ──────────
CREATE TABLE IF NOT EXISTS public.test_series_bundles (
  id text PRIMARY KEY,                 -- e.g. 'ts-final-both'
  title text NOT NULL,
  level text NOT NULL,
  group_name text NOT NULL DEFAULT 'NONE',
  subject_ids text[] NOT NULL,
  price numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Entitlements — same shape as mcq_enrollments ────────────────────────────
CREATE TABLE IF NOT EXISTS public.test_series_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id text NOT NULL REFERENCES public.test_series_subjects(id),
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  access_until timestamptz,            -- NULL = lifetime access (one-time purchase, not a subscription)
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ts_enrollments_user ON public.test_series_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_ts_subjects_level_group ON public.test_series_subjects(level, group_name);

-- ─── Link the existing `tests` table (the actual uploadable papers) to a subject ──
ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS subject_id text REFERENCES public.test_series_subjects(id),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_tests_subject_status ON public.tests(subject_id, status);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.test_series_subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active test series subjects" ON public.test_series_subjects;
CREATE POLICY "Anyone can view active test series subjects"
  ON public.test_series_subjects FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage test series subjects" ON public.test_series_subjects;
CREATE POLICY "Admins manage test series subjects"
  ON public.test_series_subjects FOR ALL USING (public.is_admin());

ALTER TABLE public.test_series_bundles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active test series bundles" ON public.test_series_bundles;
CREATE POLICY "Anyone can view active test series bundles"
  ON public.test_series_bundles FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage test series bundles" ON public.test_series_bundles;
CREATE POLICY "Admins manage test series bundles"
  ON public.test_series_bundles FOR ALL USING (public.is_admin());

ALTER TABLE public.test_series_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students see own test series enrollments" ON public.test_series_enrollments;
CREATE POLICY "Students see own test series enrollments"
  ON public.test_series_enrollments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage test series enrollments" ON public.test_series_enrollments;
CREATE POLICY "Admins manage test series enrollments"
  ON public.test_series_enrollments FOR ALL USING (public.is_admin());

-- `tests` already has RLS from schema_rls.sql ("Auth users can view tests" /
-- "Admins manage tests") — no change needed there.
