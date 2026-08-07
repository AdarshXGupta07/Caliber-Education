-- ═══════════════════════════════════════════════════════════════════════════
-- RUN THIS SECOND (after RUN_THIS_test_series_and_contact.sql)
-- Adds: 1:1 session booking workflow, test-series bundling into courses,
--       and file-retention tracking for the 7-day auto-delete.
-- Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1:1 sessions ────────────────────────────────────────────────────────────
-- session_bookings already exists; extend it for the purchase→assign→schedule flow.
ALTER TABLE public.session_bookings
  ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS student_note text,
  ADD COLUMN IF NOT EXISTS mentor_note text;

-- scheduled_at must be nullable — a booking exists before a slot is chosen
ALTER TABLE public.session_bookings ALTER COLUMN scheduled_at DROP NOT NULL;

-- Widen the status check to cover the full lifecycle
ALTER TABLE public.session_bookings DROP CONSTRAINT IF EXISTS session_bookings_status_check;
ALTER TABLE public.session_bookings ADD CONSTRAINT session_bookings_status_check
  CHECK (status = ANY (ARRAY[
    'pending_assignment'::text,  -- paid, waiting for admin to assign a mentor
    'pending_schedule'::text,    -- mentor assigned, waiting for them to set a slot
    'booked'::text,              -- slot + meet link confirmed
    'completed'::text,
    'cancelled'::text
  ]));

CREATE INDEX IF NOT EXISTS idx_session_bookings_status ON public.session_bookings(status);
CREATE INDEX IF NOT EXISTS idx_session_bookings_student ON public.session_bookings(student_id);

-- ─── Test series bundled into courses ───────────────────────────────────────
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS bundled_test_series_subject_ids text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_one_on_one boolean NOT NULL DEFAULT false;

-- Mark the existing 1:1 products so purchasing them creates a session booking
UPDATE public.courses SET is_one_on_one = true
WHERE id IN (
  'final-1on1-strategy','inter-1on1-strategy','foundation-1on1-strategy',
  'career-articleship-guidance','career-cv-review','career-post-qualification',
  'career-ug-commerce-mentorship'
);

-- ─── File retention (7-day auto-delete) ─────────────────────────────────────
ALTER TABLE public.test_submissions
  ADD COLUMN IF NOT EXISTS files_purged_at timestamptz;

ALTER TABLE public.test_evaluations
  ADD COLUMN IF NOT EXISTS files_purged_at timestamptz;

-- ─── RLS: let students see + mentors manage their own sessions ──────────────
DROP POLICY IF EXISTS "Students see own sessions" ON public.session_bookings;
CREATE POLICY "Students see own sessions"
  ON public.session_bookings FOR SELECT
  USING (auth.uid() = student_id OR public.is_mentor());
