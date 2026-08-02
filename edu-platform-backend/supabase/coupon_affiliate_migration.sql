-- ═══════════════════════════════════════════════════════════════════════════
-- Caliber Education — Coupon & Affiliate System Migration
-- Run this in the Supabase SQL Editor ONCE.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 0. Helper Function ──────────────────────────────────────────────────────
-- Ensure is_admin() exists before creating RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── 1. Affiliates Table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.affiliates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  commission_type   TEXT NOT NULL DEFAULT 'percent'
                    CHECK (commission_type IN ('percent', 'flat')),
  commission_value  NUMERIC(10,2) NOT NULL DEFAULT 10,
  payout_details    TEXT,              -- UPI ID, bank details, etc.
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 2. Coupons Table ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.coupons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,         -- stored UPPERCASE
  discount_type   TEXT NOT NULL DEFAULT 'percent'
                  CHECK (discount_type IN ('percent', 'flat')),
  discount_value  NUMERIC(10,2) NOT NULL DEFAULT 0,
  affiliate_id    UUID REFERENCES public.affiliates(id) ON DELETE SET NULL,
  max_uses        INT,                          -- NULL = unlimited
  used_count      INT NOT NULL DEFAULT 0,
  max_uses_per_user INT DEFAULT 1,
  valid_from      TIMESTAMPTZ DEFAULT now(),
  valid_until     TIMESTAMPTZ,                  -- NULL = no expiry
  applicable_course_ids TEXT[] DEFAULT '{}',     -- empty array = all courses
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID,                         -- admin who created it
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 3. Coupon Usages (log table) ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id   UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_id  UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  used_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Enforce max-per-user at DB level
  UNIQUE (coupon_id, user_id)
);

-- ─── 4. Add coupon/affiliate columns to payments ─────────────────────────────

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS coupon_id         UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS discount_amount   NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS original_amount   NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS affiliate_id      UUID REFERENCES public.affiliates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS commission_amount  NUMERIC(10,2) DEFAULT 0;


-- ═══════════════════════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── affiliates ──────────────────────────────────────────────────────────────
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage affiliates"
  ON public.affiliates FOR ALL USING (public.is_admin());

-- ─── coupons ─────────────────────────────────────────────────────────────────
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active coupons (for validate)"
  ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Admins manage coupons"
  ON public.coupons FOR ALL USING (public.is_admin());

-- ─── coupon_usages ───────────────────────────────────────────────────────────
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own usage"
  ON public.coupon_usages FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Admins manage coupon usages"
  ON public.coupon_usages FOR ALL USING (public.is_admin());


-- ═══════════════════════════════════════════════════════════════════════════
-- Useful Indexes
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons (code);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon ON public.coupon_usages (coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user ON public.coupon_usages (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_affiliate ON public.payments (affiliate_id);
CREATE INDEX IF NOT EXISTS idx_payments_coupon ON public.payments (coupon_id);
