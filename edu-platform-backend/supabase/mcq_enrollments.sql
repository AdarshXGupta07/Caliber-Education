-- ==============================================================================
-- 🚨 MCQ ENROLLMENTS TRACKING 🚨
-- Tracks exactly which subjects a student has unlocked via payment.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.mcq_enrollments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_code text NOT NULL, -- e.g. "FR", "AFM"
    level text NOT NULL, -- e.g. "FINAL", "INTERMEDIATE"
    payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
    access_until timestamp with time zone, -- tracks expiration date based on duration
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_mcq_enrollments_user ON public.mcq_enrollments(user_id);
