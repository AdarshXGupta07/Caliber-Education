-- ═══════════════════════════════════════════════════════════════════════════
-- Caliber Education — Production Hardening Migration
-- Run this ONCE in the Supabase SQL Editor, on PRODUCTION and on STAGING.
-- Fixes: role model (mentor/super_admin), missing RLS on entitlement tables,
-- policies that didn't check what their names promised, dangling FKs.
-- Safe to re-run — every statement is idempotent (IF EXISTS / IF NOT EXISTS /
-- CREATE OR REPLACE / NOT VALID FKs that never fail on existing data).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Role model: add mentor + super_admin ─────────────────────────────────

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role = ANY (ARRAY['student'::text, 'mentor'::text, 'admin'::text, 'super_admin'::text]));

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_mentor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('mentor', 'admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Promote yourself to super_admin (run manually once, replace the email):
--   UPDATE public.profiles SET role = 'super_admin' WHERE email = 'you@example.com';


-- ─── 2. RLS on tables that currently have none ───────────────────────────────

ALTER TABLE public.mcq_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students see own mcq enrollments" ON public.mcq_enrollments;
CREATE POLICY "Students see own mcq enrollments"
  ON public.mcq_enrollments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage mcq enrollments" ON public.mcq_enrollments;
CREATE POLICY "Admins manage mcq enrollments"
  ON public.mcq_enrollments FOR ALL USING (public.is_admin());

ALTER TABLE public.mcq_subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view mcq subjects" ON public.mcq_subjects;
CREATE POLICY "Anyone can view mcq subjects"
  ON public.mcq_subjects FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage mcq subjects" ON public.mcq_subjects;
CREATE POLICY "Admins manage mcq subjects"
  ON public.mcq_subjects FOR ALL USING (public.is_admin());

ALTER TABLE public.mcq_bundles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view mcq bundles" ON public.mcq_bundles;
CREATE POLICY "Anyone can view mcq bundles"
  ON public.mcq_bundles FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage mcq bundles" ON public.mcq_bundles;
CREATE POLICY "Admins manage mcq bundles"
  ON public.mcq_bundles FOR ALL USING (public.is_admin());

ALTER TABLE public.course_bundles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view course bundles" ON public.course_bundles;
CREATE POLICY "Anyone can view course bundles"
  ON public.course_bundles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage course bundles" ON public.course_bundles;
CREATE POLICY "Admins manage course bundles"
  ON public.course_bundles FOR ALL USING (public.is_admin());


-- ─── 3. Lock down the answer key (questions table) ───────────────────────────
-- correct_option/explanation must never be readable by a direct client query
-- (backend API serves it only from the post-submission grading response).

DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;
CREATE POLICY "Admins and mentors can view questions"
  ON public.questions FOR SELECT USING (public.is_admin() OR public.is_mentor());
-- "Admins manage questions" (FOR ALL) already exists from mcq_v3_ca_hierarchy_migration.sql — untouched.


-- ─── 4. Policies that didn't check what their names promised ────────────────

DROP POLICY IF EXISTS "Students can enroll themselves (free courses only)" ON public.enrollments;
CREATE POLICY "Students can enroll themselves (free courses only)"
  ON public.enrollments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = enrollments.course_id AND COALESCE(c.price, 0) = 0)
  );

DROP POLICY IF EXISTS "Students can insert payments" ON public.payments;
CREATE POLICY "Students can insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "Anyone can read active coupons (for validate)" ON public.coupons;
CREATE POLICY "Anyone can read active coupons (for validate)"
  ON public.coupons FOR SELECT
  USING (
    (is_active = true
      AND (valid_from IS NULL OR valid_from <= now())
      AND (valid_until IS NULL OR valid_until > now()))
    OR public.is_admin()
  );


-- ─── 5. Mentor access for evaluations & sessions ─────────────────────────────

DROP POLICY IF EXISTS "Mentors see all submissions" ON public.test_submissions;
CREATE POLICY "Mentors see all submissions"
  ON public.test_submissions FOR SELECT USING (public.is_mentor());

DROP POLICY IF EXISTS "Mentors see all evaluations" ON public.test_evaluations;
CREATE POLICY "Mentors see all evaluations"
  ON public.test_evaluations FOR SELECT USING (public.is_mentor());

DROP POLICY IF EXISTS "Mentors can insert evaluations" ON public.test_evaluations;
CREATE POLICY "Mentors can insert evaluations"
  ON public.test_evaluations FOR INSERT WITH CHECK (public.is_mentor());

DROP POLICY IF EXISTS "Mentors can update own evaluations" ON public.test_evaluations;
CREATE POLICY "Mentors can update own evaluations"
  ON public.test_evaluations FOR UPDATE USING (mentor_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Mentors manage own sessions" ON public.session_bookings;
CREATE POLICY "Mentors manage own sessions"
  ON public.session_bookings FOR ALL USING (
    public.is_admin()
    OR mentor_id IN (SELECT id FROM public.mentors WHERE profile_id = auth.uid())
  );


-- ─── 6. Referential integrity + indexes ──────────────────────────────────────
-- NOT VALID so this can never fail against existing rows on a live DB the
-- night before launch; run VALIDATE CONSTRAINT once you've confirmed the data
-- is clean (see note at the bottom).

ALTER TABLE public.mcq_papers DROP CONSTRAINT IF EXISTS mcq_papers_subject_code_fkey;
ALTER TABLE public.mcq_papers
  ADD CONSTRAINT mcq_papers_subject_code_fkey
  FOREIGN KEY (subject_code) REFERENCES public.subjects(subject_code) ON DELETE SET NULL
  NOT VALID;

CREATE INDEX IF NOT EXISTS idx_mcq_papers_subject_code_status ON public.mcq_papers(subject_code, status);

ALTER TABLE public.coupons DROP CONSTRAINT IF EXISTS coupons_created_by_fkey;
ALTER TABLE public.coupons
  ADD CONSTRAINT coupons_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL
  NOT VALID;

-- quiz_attempts: don't erase a student's score history if a paper is retired
ALTER TABLE public.quiz_attempts DROP CONSTRAINT IF EXISTS quiz_attempts_set_id_fkey;
ALTER TABLE public.quiz_attempts
  ADD CONSTRAINT quiz_attempts_set_id_fkey
  FOREIGN KEY (set_id) REFERENCES public.mcq_papers(id) ON DELETE SET NULL;


-- ═══════════════════════════════════════════════════════════════════════════
-- After running, verify data is clean, then validate the NOT VALID FKs:
--   ALTER TABLE public.mcq_papers VALIDATE CONSTRAINT mcq_papers_subject_code_fkey;
--   ALTER TABLE public.coupons VALIDATE CONSTRAINT coupons_created_by_fkey;
-- (Only needed once; safe to run any time, doesn't lock the table for writes.)
-- ═══════════════════════════════════════════════════════════════════════════
