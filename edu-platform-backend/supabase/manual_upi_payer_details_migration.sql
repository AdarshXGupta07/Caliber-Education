-- Adds the payer's own UPI ID and name to manual UPI submissions, so admin
-- has enough to cross-check a claimed reference against their actual
-- bank/UPI app transaction list (name + payer VPA + reference, not just the
-- reference alone). Purely additive, same service-role-bypasses-RLS note as
-- manual_upi_payment_migration.sql applies here too.

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS payer_upi_id TEXT,
  ADD COLUMN IF NOT EXISTS payer_name TEXT;
