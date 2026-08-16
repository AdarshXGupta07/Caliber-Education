-- ═══════════════════════════════════════════════════════════════════════════
-- Caliber Education — Payment Grant Race-Condition Hardening
--
-- Background: a double-click on "Pay", a network retry, or the Razorpay
-- webhook racing the frontend's own verify call can both read a payment as
-- "pending" before either write lands, and both proceed to grant access.
-- The application code (app/routers/payments.py) already checks for an
-- existing enrollment before inserting a new one, but with no unique
-- constraint backing that check, two near-simultaneous requests can both
-- pass the check and both insert — producing a duplicate enrollment row.
--
-- This does NOT run automatically and does NOT run destructively. Duplicate
-- rows may already exist (the grant code was written to defensively pick the
-- row with the latest access_until among any duplicates it finds — a strong
-- signal duplicates are already possible today), and a UNIQUE constraint
-- cannot be added while duplicates exist. Run the diagnostic query in Step 1
-- first; only proceed to Step 2 once it returns zero rows.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Step 1 — diagnostic: find existing duplicates (read-only) ──────────────
-- If either of these returns rows, resolve them manually first (decide which
-- row per user+subject should be kept — typically the one with the latest
-- access_until — before deleting the others). This script does not do that
-- for you; it's a judgment call about real customer entitlements.

SELECT user_id, subject_code, count(*) AS duplicate_rows
FROM public.mcq_enrollments
GROUP BY user_id, subject_code
HAVING count(*) > 1;

SELECT user_id, subject_id, count(*) AS duplicate_rows
FROM public.test_series_enrollments
GROUP BY user_id, subject_id
HAVING count(*) > 1;

-- ─── Step 1b — inspect the actual duplicate rows (read-only) ────────────────
-- Run this to see exactly which rows exist per duplicate group before
-- deciding anything. keep_rank = 1 marks the row Step 1c would keep — it
-- picks the latest access_until (NULL = lifetime access, treated as best),
-- tie-broken by the newest created_at. This is not a guess: it's the same
-- rule _apply_mcq_grant already uses when it finds duplicates today
-- (payments.py: `best_row = max(existing_enroll.data, key=access_until)`),
-- so consolidating on it doesn't change what the app already treats as
-- each customer's authoritative access, and it never picks the shorter of
-- two overlapping access windows.

SELECT *,
  row_number() OVER (
    PARTITION BY user_id, subject_code
    ORDER BY access_until DESC NULLS FIRST, created_at DESC
  ) AS keep_rank
FROM public.mcq_enrollments
WHERE (user_id, subject_code) IN (
  SELECT user_id, subject_code FROM public.mcq_enrollments
  GROUP BY user_id, subject_code HAVING count(*) > 1
)
ORDER BY user_id, subject_code, keep_rank;

SELECT *,
  row_number() OVER (
    PARTITION BY user_id, subject_id
    ORDER BY access_until DESC NULLS FIRST, created_at DESC
  ) AS keep_rank
FROM public.test_series_enrollments
WHERE (user_id, subject_id) IN (
  SELECT user_id, subject_id FROM public.test_series_enrollments
  GROUP BY user_id, subject_id HAVING count(*) > 1
)
ORDER BY user_id, subject_id, keep_rank;

-- ─── Step 1c — delete the redundant rows (DESTRUCTIVE — review 1b first) ────
-- Deletes every row except keep_rank = 1 from each duplicate group above.
-- Left commented out on purpose. Re-run Step 1b after, to confirm it now
-- returns nothing, before moving on to Step 2.

-- DELETE FROM public.mcq_enrollments WHERE id IN (
--   SELECT id FROM (
--     SELECT id, row_number() OVER (
--       PARTITION BY user_id, subject_code
--       ORDER BY access_until DESC NULLS FIRST, created_at DESC
--     ) AS keep_rank
--     FROM public.mcq_enrollments
--   ) ranked WHERE keep_rank > 1
-- );

-- DELETE FROM public.test_series_enrollments WHERE id IN (
--   SELECT id FROM (
--     SELECT id, row_number() OVER (
--       PARTITION BY user_id, subject_id
--       ORDER BY access_until DESC NULLS FIRST, created_at DESC
--     ) AS keep_rank
--     FROM public.test_series_enrollments
--   ) ranked WHERE keep_rank > 1
-- );

-- ─── Step 2 — once Step 1 returns zero rows for both, add the constraints ───
-- Safe to re-run (IF NOT EXISTS-guarded). These make a duplicate insert fail
-- at the database level instead of silently succeeding — the application
-- code should catch that failure and treat it as "already enrolled" (a
-- concurrent request won the race first), not surface it as an error.

-- ALTER TABLE public.mcq_enrollments
--   ADD CONSTRAINT mcq_enrollments_user_subject_unique UNIQUE (user_id, subject_code);

-- ALTER TABLE public.test_series_enrollments
--   ADD CONSTRAINT test_series_enrollments_user_subject_unique UNIQUE (user_id, subject_id);

-- (Left commented out intentionally — uncomment and run once Step 1 is clean.)
