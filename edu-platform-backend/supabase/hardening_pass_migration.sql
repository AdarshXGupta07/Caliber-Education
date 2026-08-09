-- ==============================================================================
-- HARDENING PASS MIGRATION
--
-- Two new tables, both additive — nothing existing is altered or dropped:
--
--   1. mcq_attempt_sessions — persists an MCQ test attempt server-side while
--      it's in progress, so a browser refresh, crash, or navigation away
--      never silently loses a student's progress, and the backend (not the
--      client) is authoritative for the attempt's start time / deadline /
--      submitted-once guarantee.
--
--   2. mentor_permissions — centralized, scalable per-mentor capability
--      grants (evaluate papers / manage 1:1 sessions / manage test series),
--      enforced server-side by _mentor_has_permission() in admin.py, not
--      just hidden from the admin panel UI. A single `permissions` jsonb
--      column rather than one boolean column per capability, so adding a
--      future permission needs zero migration.
--
-- Safe to run multiple times: every statement uses IF NOT EXISTS, and the
-- mentor_permissions backfill only inserts rows that don't already exist.
-- Nothing here deletes or rewrites existing data.
-- ==============================================================================


-- ── 1. mcq_attempt_sessions ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.mcq_attempt_sessions (
    id                  text PRIMARY KEY,                     -- app-generated, "att-<hex16>"
    user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    set_id              uuid NOT NULL REFERENCES public.mcq_papers(id) ON DELETE CASCADE,
    status              text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted')),
    question_order      jsonb NOT NULL DEFAULT '[]'::jsonb,    -- ordered question-id array (client-computed shuffle, persisted verbatim)
    answers             jsonb NOT NULL DEFAULT '{}'::jsonb,    -- question_id -> selected option index | null
    per_question_times  jsonb NOT NULL DEFAULT '[]'::jsonb,    -- positional array, parallel to question_order
    current_index       integer NOT NULL DEFAULT 0,
    section_elapsed     jsonb NOT NULL DEFAULT '{}'::jsonb,    -- section_id -> seconds
    started_at          timestamptz NOT NULL DEFAULT now(),    -- authoritative clock origin for the deadline
    duration_minutes    integer NOT NULL,                      -- snapshotted from mcq_papers.duration_minutes AT START
    last_saved_at       timestamptz NOT NULL DEFAULT now(),
    submitted_at        timestamptz,
    created_at          timestamptz NOT NULL DEFAULT now()
);

-- At most one in-progress attempt per (user, paper) — this is both the
-- resume lookup key and the DB-level guard against two concurrent requests
-- (e.g. two open tabs) both creating an attempt for the same paper at once.
CREATE UNIQUE INDEX IF NOT EXISTS idx_mcq_attempt_sessions_active
    ON public.mcq_attempt_sessions(user_id, set_id)
    WHERE status = 'in_progress';

CREATE INDEX IF NOT EXISTS idx_mcq_attempt_sessions_user ON public.mcq_attempt_sessions(user_id);


-- ── 2. mentor_permissions ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.mentor_permissions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id   uuid NOT NULL UNIQUE REFERENCES public.mentors(id) ON DELETE CASCADE,
    permissions jsonb NOT NULL DEFAULT '{}'::jsonb,   -- {"evaluate_papers": bool, "manage_sessions": bool, "manage_test_series": bool}
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentor_permissions_mentor_id ON public.mentor_permissions(mentor_id);

-- Backfill: grant every currently-existing mentor all three permissions, so
-- nothing they can already do today (evaluating papers, scheduling their
-- own sessions) breaks the moment this ships. Going forward, an admin can
-- dial individual mentors' permissions down (or up) from the new Mentors
-- tab. Only inserts where no row exists yet for that mentor — safe to re-run.
INSERT INTO public.mentor_permissions (mentor_id, permissions)
SELECT m.id, '{"evaluate_papers": true, "manage_sessions": true, "manage_test_series": true}'::jsonb
FROM public.mentors m
LEFT JOIN public.mentor_permissions mp ON mp.mentor_id = m.id
WHERE mp.mentor_id IS NULL;
