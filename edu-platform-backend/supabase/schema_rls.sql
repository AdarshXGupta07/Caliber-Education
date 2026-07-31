-- ═══════════════════════════════════════════════════════════════════════════
-- Caliber Education — Supabase Schema + Auth Setup
-- Run this ONCE in the Supabase SQL Editor after creating your project.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Step 1: Auto-provision profiles on new user sign-up ─────────────────────
-- This trigger runs automatically when a user signs up via Supabase Auth
-- (including Google OAuth) and creates a matching row in public.profiles.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'student'   -- Every new user starts as a student
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger to avoid duplicates during re-runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── Step 2: Admin role helper function ──────────────────────────────────────
-- Used by RLS policies to check if the calling user is an admin.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ═══════════════════════════════════════════════════════════════════════════
-- Step 3: Enable RLS and add policies
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── profiles ────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());


-- ─── courses (public read, admin write) ──────────────────────────────────────
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT USING (true);

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL USING (public.is_admin());


-- ─── enrollments ─────────────────────────────────────────────────────────────
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see own enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Students can enroll themselves (free courses only)"
  ON public.enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all enrollments"
  ON public.enrollments FOR ALL USING (public.is_admin());


-- ─── payments ────────────────────────────────────────────────────────────────
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Students can insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payments"
  ON public.payments FOR ALL USING (public.is_admin());


-- ─── quiz_attempts ───────────────────────────────────────────────────────────
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see own attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Students can insert their own attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ─── mcq_series + mcq_sets + set_sections + questions (public read) ──────────
ALTER TABLE public.mcq_series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view MCQ series" ON public.mcq_series FOR SELECT USING (true);
CREATE POLICY "Admins manage MCQ series" ON public.mcq_series FOR ALL USING (public.is_admin());

ALTER TABLE public.mcq_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view MCQ sets" ON public.mcq_sets FOR SELECT USING (true);
CREATE POLICY "Admins manage MCQ sets" ON public.mcq_sets FOR ALL USING (public.is_admin());

ALTER TABLE public.set_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view sections" ON public.set_sections FOR SELECT USING (true);
CREATE POLICY "Admins manage sections" ON public.set_sections FOR ALL USING (public.is_admin());

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Admins manage questions" ON public.questions FOR ALL USING (public.is_admin());


-- ─── mentors (public read, admin write) ──────────────────────────────────────
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view mentors" ON public.mentors FOR SELECT USING (true);
CREATE POLICY "Admins manage mentors" ON public.mentors FOR ALL USING (public.is_admin());


-- ─── session_bookings ────────────────────────────────────────────────────────
ALTER TABLE public.session_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see own sessions"
  ON public.session_bookings FOR SELECT
  USING (auth.uid() = student_id OR student_id IS NULL OR public.is_admin());

CREATE POLICY "Students can book open slots"
  ON public.session_bookings FOR UPDATE
  USING (student_id IS NULL)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins manage all sessions"
  ON public.session_bookings FOR ALL USING (public.is_admin());


-- ─── tests (authenticated read, admin write) ─────────────────────────────────
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can view tests" ON public.tests FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage tests" ON public.tests FOR ALL USING (public.is_admin());


-- ─── test_submissions ────────────────────────────────────────────────────────
ALTER TABLE public.test_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see own submissions"
  ON public.test_submissions FOR SELECT
  USING (auth.uid() = student_id OR public.is_admin());

CREATE POLICY "Students can submit"
  ON public.test_submissions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins manage all submissions"
  ON public.test_submissions FOR ALL USING (public.is_admin());


-- ─── test_evaluations ────────────────────────────────────────────────────────
ALTER TABLE public.test_evaluations ENABLE ROW LEVEL SECURITY;

-- Join to test_submissions to scope by student
CREATE POLICY "Students see evaluations of own submissions"
  ON public.test_evaluations FOR SELECT
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.test_submissions ts
      WHERE ts.id = test_evaluations.submission_id
        AND ts.student_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage evaluations"
  ON public.test_evaluations FOR ALL USING (public.is_admin());


-- ═══════════════════════════════════════════════════════════════════════════
-- Step 4: Make your first admin
-- After you sign up with Google for the first time, run this SQL to
-- promote your own account to admin:
--
--   UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
--
-- ═══════════════════════════════════════════════════════════════════════════
