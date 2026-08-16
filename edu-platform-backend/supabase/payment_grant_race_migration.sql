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
