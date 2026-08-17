-- Manual UPI payment flow — Razorpay isn't live yet, so students pay via a
-- static UPI QR code and submit their transaction reference for admin
-- review. Purely additive; the Razorpay path is untouched.
--
-- The service-role client (app/core/database.py) bypasses RLS, so no RLS
-- policy changes are needed for these new columns — the existing insert
-- policy (production_hardening_migration.sql) only constrains what a
-- student could insert directly, which never happens; all inserts go
-- through the backend's service-role client.

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'razorpay'
    CHECK (payment_method IN ('razorpay', 'manual_upi')),
  ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Prevents the same UPI transaction reference from being submitted twice
-- (whether by the same student retrying, or two students colliding) —
-- app-level duplicate check happens first, this is the DB-level backstop
-- for the race window between that check and the insert.
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_manual_reference
  ON public.payments (payment_reference)
  WHERE payment_method = 'manual_upi' AND payment_reference IS NOT NULL;
